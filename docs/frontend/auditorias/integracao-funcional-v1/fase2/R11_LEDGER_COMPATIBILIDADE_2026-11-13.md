# Fase 2 R11: compatibilidade dos PASS da R10 com o harness R11

A Fase 2 continua NÃO CERTIFICADA. Este registro sustenta a inclusão de `050beb1bbc3ce886227865178b7bdbecef964033` (harness da R10) em `compatibleHarnessShas` do ledger v4.

## Evidência da R10

- Auth `43459877744`, attempt 1; job privado `132004527239`.
- Artefato `14059408905`: ZIP `sha256:5a1b08e2eaa519d3e350488994c8625cd0bc4a60fe9d73e1c19432e717971236`, CRC válido, dois membros, `SHA256SUMS` OK.
- `report.json` `a70976206a97571b9613ffb55dfb18491a5a76e4e337afd7c8f7b378d50eb2fc`, schema v3, produto `e6c8cb0…`, deployment `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`, harness `050beb1…`.
- 52 linhas em ordem canônica, todas `PASS`/`FINISH`, sem código de falha e com zero erros por linha. Cada uma foi aceita individualmente por `summarizeNavigation` do próprio auditor.
- Erros globais: `transportErrors` 1 e `httpErrors` 1 fora das linhas (`POST` `ABORTED`, API), com logout verificado. Esse erro não pertence a nenhum caso e não entra no ledger. Os controles globais serão verificados na execução de fechamento.

## Entradas do ledger v4

Índices 1-51 da R10, com a evidência acima. O índice 52 (V123/390) fica pendente por decisão do titular (PLAN R11), para que a execução de fechamento parta do mesmo contexto do logout da R9 e da R10.

## Por que o harness R11 não altera a verificação de um caso

O BUILD R11 muda apenas:

1. **Instrumentação do logout.** São ouvintes `request`/`requestfailed` registrados no bloco de logout, depois que a matriz terminou, e removidos ao fim dele. Emitem só o marcador fechado `NAVIGATION_LOGOUT_TRANSPORT`, protegidos por `try/catch`, e não tocam contadores, fence, relatório nem veredito.
2. **Contadores da sessão por fase.** Três leituras do contador de transporte da sessão (antes do logout, depois do logout e depois do encerramento do navegador), emitidas no marcador fechado `NAVIGATION_SESSION_TRANSPORT_PHASES`, só com inteiros, depois da matriz e sem alterar contadores nem veredito.
3. **Nonce e ancestral do PLAN.** `integracao-v1-fase2-nav-20261113-r11`, R10 consumida, PLAN R11 exigido como ancestral.
4. **Pin do ledger.** v4 encadeada à v3 (`b38edb05…`), retomada 52, `pendingCount` 1.

Nada disso participa da verificação de um caso (navegação direta, recarga, menu, links, controles, contadores por linha e prazos). O produto e o deployment continuam `e6c8cb0` e `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`.

## R12: harness do preflight

A R11 não executou caso algum: o preflight parou em `REQUEST_API_TIMEOUT` antes de credenciais. O BUILD R12 muda apenas:

1. **Leituras do preflight.** As três listagens de execuções (workflow selecionado, workflow oposto e releitura final) passam a consultar só os SHAs da REQUEST (`head_sha`), com a mesma paginação, os mesmos limites e a mesma filtragem por `requestShas`. O prazo de 60 s e os 5 s por chamada não mudam.
2. **Diagnóstico fechado** quando o prazo estoura: quantidade de chamadas, tipo de endpoint e tempo decorrido.
3. **Nonce** `integracao-v1-fase2-nav-20261113-r12`, R11 consumida, PLAN R12 como ancestral.

Tudo isso acontece antes do login e não participa da verificação de um caso. Os PASS 1-51 da R10 (`050beb1`) continuam compatíveis; o ledger v4 não muda.

## R13, R14 e consolidação

- **R13** (#647): só o nonce mudou.
- **R14** (#650): o observador da sessão deixa de contar como erro só o `POST /auth/v1/logout` `ERR_ABORTED` com 204 observado antes. O logout acontece fora de todos os casos, e a mudança só pode tornar a contagem global menos sujeita a falso erro; nenhuma linha da matriz é afetada. Os PASS 1-51 da R10 (`050beb1`) continuam compatíveis.
- **Consolidação:** `ccf5343` (harness da R14, que produziu o índice 52) entra em `compatibleHarnessShas`. Do `ccf5343` até a PR de consolidação, só mudam o pin do ledger, um teste e comentários.


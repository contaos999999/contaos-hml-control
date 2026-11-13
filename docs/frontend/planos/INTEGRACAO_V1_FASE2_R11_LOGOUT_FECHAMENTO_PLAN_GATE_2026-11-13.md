# Fase 2 R11: aborto global no logout e execução curta de fechamento

## Estado terminal R10, sem certificação

A Fase 2 continua NÃO CERTIFICADA. Cadeia integrada na `main`:
- PLAN R10: #636, merge `0c0093c486eaffc35d260c5338e643de270a2542` (commit do PLAN `157b397`).
- BUILD R10: #637, merge `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97`.
- Pins R10: #638, merge `bb089b8cffc0cdfe96bfe77bb0a41f0942d770f3`.
- REQUEST R10: #639, merge `050beb1bbc3ce886227865178b7bdbecef964033`. A revisão canônica `5894299658` foi a última no HEAD, conferida pela API.

Publicação HML do BUILD R10: `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`, READY em produção, `githubCommitSha` `e6c8cb0…`. O "Ignored Build Step" libera somente esse SHA.

Execuções:
- Auth `43459877744`, attempt 1. Solicitação `132003635627` SUCCESS; privado `132004527239` FAILURE (`NAVIGATION_INCOMPLETE`).
- Fixtures `43459877628`: SUCCESS.

Artefato `14059408905` (`trilha-a-private-43459877744-1`, 2427 bytes, retenção até 11/02/2027):
- ZIP `sha256:5a1b08e2eaa519d3e350488994c8625cd0bc4a60fe9d73e1c19432e717971236`, CRC válido, dois membros, `SHA256SUMS` OK.
- `report.json` `a70976206a97571b9613ffb55dfb18491a5a76e4e337afd7c8f7b378d50eb2fc`, schema `contaos.navigation.audit.v3`, `harnessSha` `050beb1…`, `frontendSha` `e6c8cb0…`, deployment `dpl_9t3Q…`.
- **52/52 casos PASS**, cada linha aceita individualmente por `summarizeNavigation`, em ordem canônica, com zero erros por linha.
- Sessão, MASTER, organização e logout `true`; `fenceDiagnostic` nulo; `pageErrors` 0; mutações bloqueadas 0.
- **Globais: `transportErrors` 1 e `httpErrors` 1**, sem correspondência em nenhuma linha. `networkFailure`: `ABORTED`, destino API, `POST`, `fetch`.

R10 está consumida, sem rerun, replay nem reuso de nonce.

## Localização do aborto

- Nenhum marcador `NAVIGATION_TRANSPORT_DETAIL` foi emitido. O ouvinte de detalhe fica ativo do primeiro ao último caso (a linha diagnóstica nunca volta a nulo), então o pedido falhou **fora da matriz**: no logout, que roda depois que os ouvintes da navegação são removidos.
- A R9 tem a mesma assinatura: `transportErrors` global 3 contra 2 nas linhas, `networkFailure` `POST` `ABORTED` e logout `true`. R7 e R8 pararam antes do logout e não têm erro global extra.
- Nas duas, o último caso é V123/390 (`/`, painel) e o logout parte dessa tela.

A causa exata (qual `POST`, em qual etapa do logout) ainda não está provada. Não se escolhe correção sem essa prova.

## Decisão do titular (13/11/2026)

Gravar no ledger 51 dos 52 PASS da R10 e deixar 1 caso pendente, para que a próxima execução rode só esse caso e o logout, com diagnóstico, em poucos minutos.

- O caso pendente é o **índice 52 (V123/390)**, o mesmo contexto de onde o logout partiu na R9 e na R10.
- Os índices 1-51 entram com a evidência da R10, porque cada linha foi aceita individualmente com zero erros. O erro global não pertence a nenhum caso.
- Controles globais nunca são herdados: sessão, MASTER, organização, logout e **zero erros globais** precisam ser verificados na execução que fechar a matriz.
- Se a execução curta sair limpa, ela fecha a matriz (52/52 no ledger) com todos os controles globais e a Fase 2 pode ser certificada.
- Se o aborto se repetir, a instrumentação nova identifica a origem. Se a correção for no produto, ela exige nova publicação, `SUPERSEDED` de todos os PASS e os 52 casos de novo. Se for no harness, sem efeito sobre a verificação de um caso, só a execução curta se repete.

## BUILD R11

1. **Instrumentação do logout** (`authenticated-visual-audit.mjs`): durante o logout, cada `requestfailed` emite um marcador fechado com etapa do logout (`DRAIN`, `MENU_CLOSE`, `CONTROL`, `CLICK`, `REDIRECT`, `POST_DRAIN`), classe do endpoint pela lista fechada, método, tipo de recurso, pedido de navegação, frame, ms desde o clique em "Sair" e início do pedido relativo ao clique. Sem URL, query, cabeçalho ou corpo; não lança e não muda contagem nem veredito.
2. **Ledger v4** encadeado à v3 (`b38edb05…`): 51 PASS (índices 1-51) da R10, com run `43459877744`, attempt 1, artefato `14059408905`, ZIP `5a1b08e2…`, report `a7097620…`, harness `050beb1…`, produto `e6c8cb0…` e deployment `dpl_9t3Q…`. Pendente: índice 52; `pendingCount` 1.
3. **Compatibilidade de harness**: `050beb1` entra em `compatibleHarnessShas`, com relatório de não impacto. O BUILD R11 só acrescenta instrumentação fora dos casos.
4. **Nonce** `integracao-v1-fase2-nav-20261113-r11`, R10 consumida, este PLAN como ancestral.

## Proibições

Continua proibido:
- ignorar `ABORTED`, suprimir `requestfailed`, zerar contadores, relaxar deadlines ou desabilitar o fence;
- considerar erro global como ruído, ou herdar controles globais de outra execução;
- alterar backend, SQL, RLS, RBAC, Auth, Storage, Edge, segredos, YAML, lockfile, branch protection, `types.ts` ou PROD;
- alterar produto neste ciclo.

Zero-Drift, LOCK, isolamento e fail-closed continuam obrigatórios. PLAN, BUILD e REQUEST são integrados por merge commit; a revisão canônica é a última no HEAD da REQUEST. Rollback apenas por nova PR.

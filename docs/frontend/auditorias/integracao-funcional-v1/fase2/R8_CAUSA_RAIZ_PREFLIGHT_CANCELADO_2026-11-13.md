# Fase 2 R8: causa raiz do FENCE_DRAIN_TIMEOUT V110/390 (R7, caso 26)

Fase 2 continua NÃO CERTIFICADA. Este relatório atende ao PLAN R8 (merge `78a5f4b96fe756f96a43e53ab877d17145d986f2`), itens 1 a 5 da investigação obrigatória. Não contém dados privados: o experimento usa servidores locais sintéticos, sem credenciais nem HML.

## Sintoma (R7)

Auth `43358055422`, attempt 1, job privado `131665158901`, artefato `14008077669` (ZIP `sha256:c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3`):
- índices 1-25 PASS;
- índice 26, V110/390, `LINKS/LINK_CLICK` para `SYS04`: três `GET` `API_REST` `ABORTED`, depois `FENCE_DRAIN_TIMEOUT` e `NAVIGATION_INCOMPLETE`;
- índices 27-52 não executados.

## Mecanismo do drain

`fence.drain()` só libera com `active.size === 0` (handlers de `Fetch.requestPaused`), `requests.size === 0` em `createRequestLifecycle` e `pendingNetwork === 0`, num prazo de 10 s. Um registro só deixa `requests` quando há terminal `Network.loadingFinished` ou `Network.loadingFailed` e nenhum ticket de Fetch ativo.

## Causa comprovada

As leituras do Supabase são cross-origin e levam os cabeçalhos `apikey` e `Authorization`. Por isso o Chromium envia antes um **preflight CORS (OPTIONS)**, que o fence observa como registro próprio (`type: "Other"`, `initiator: {type: "preflight", requestId: <GET>}`).

Quando a rota de origem desmonta e aborta legitimamente o `GET` (AbortController do componente) enquanto o preflight ainda está em voo:

1. o `GET` recebe `Network.loadingFailed` com `canceled: true` e `net::ERR_ABORTED`, que são os `ABORTED` vistos no R7;
2. o preflight continua na rede. Sua resposta chega ao Fetch (`Fetch.requestPaused` com `responseStatusCode`) e o fence a libera;
3. **o Chromium não emite `Network.responseReceived`, `loadingFinished` nem `loadingFailed` para esse OPTIONS.** O registro do preflight nunca recebe terminal, `requests.size` fica em 1 e o drain esgota em `FENCE_DRAIN_TIMEOUT`.

A classificação, nos termos do item 3 do PLAN R8, é **(a)**: requisição abortada pelo app durante navegação legítima, mas ainda contabilizada como pendente pelo auditor. A causa é de **instrumentação**, não de produto. O `networkidle` do Playwright não conta preflights, o que explica o sintoma passar pelas esperas do Playwright e ficar preso só no fence.

## Experimento em Chromium real (reproduzível)

O experimento usa Chrome `/usr/bin/google-chrome` via `playwright-core` 1.63. Há duas origens locais: a página, e uma "API" com CORS e `apikey` que atrasa o OPTIONS em 2 s. Uma sessão CDP com `Network.enable` e `Fetch.enable` em todos os pedidos, no estágio Request com `interceptResponse: true`, como o fence, alimenta o **`createRequestLifecycle` real** do auditor e aplica o mesmo critério de drain (10 s). O script tem SHA-256 `ce487a551da644224744d3e6a5a7a35bb3df80cb15172c29f725122bbbe1a218`.

| Cenário | `main` `78a5f4b` | Esta correção |
|---|---|---|
| GET com preflight, abortado em 300 ms (caso R7) | **drain trava em 5/5 execuções**; `active: 1`; sem terminal do OPTIONS mesmo após 20 s | drain esvazia; `retiredPreflights: 1` |
| GET com preflight, sem aborto (controle) | drain esvazia; o OPTIONS recebe `responseReceived` (`Preflight`) e `loadingFinished` | igual, `retiredPreflights: 0` |
| GET simples (controle) | drain esvazia | igual |
| GET abortado e servidor **sem resposta** ao OPTIONS | trava | **continua travando** (fail-closed preservado) |

Sequência observada no caso R7 (o tempo varia em milissegundos):

```
Network.requestWillBeSent  OPTIONS type=Other initiator=preflight(main=<GET>)
Fetch.requestPaused        OPTIONS rt=XHR (Request)       -> continueRequest
Network.requestWillBeSent  GET type=Fetch
Network.loadingFailed      GET err=net::ERR_ABORTED canceled
Fetch.requestPaused        OPTIONS rt=XHR status=204      -> continueResponse
(nenhum terminal Network para o OPTIONS)
```

## Correção (somente auditor)

`scripts/hml/authenticated-visual-audit.mjs`, `createRequestLifecycle()`: o registro do preflight é aposentado (`terminal: {kind: "PREFLIGHT_RETIRED"}`, contador `retiredPreflights`) **somente** com as três provas positivas:

1. o `Network.requestWillBeSent` do OPTIONS tem `initiator.type === "preflight"` e `initiator.requestId` de outro pedido da mesma sessão;
2. esse pedido principal é `GET` e recebeu `Network.loadingFailed` com `canceled`, `net::ERR_ABORTED`, sem `blockedReason`/`corsErrorStatus` e com tipo terminal igual ao do registro;
3. a resposta do próprio preflight foi pausada e **liberada** pelo fence (`lifecycle.responded(ticket)`, chamado só depois de `Fetch.continueResponse` ou `Fetch.fulfillRequest` bem-sucedidos) e não há ticket ativo.

Sem qualquer uma das provas, o registro continua pendente e o drain continua falhando fechado.

Não foi alterado: prazo do drain, tratamento de `ABORTED`, `requestfailed`, contadores de erro de transporte, política de pedidos, bloqueio de mutações, guarda nativa (8/8) e workflows.

## Testes RED/GREEN

`scripts/hml/authenticated-visual-audit.test.mjs`, 15 testes `R8 ...` determinísticos com eventos CDP sintéticos na ordem observada:
- 2 de aposentadoria (cancelamento antes e depois da resposta do OPTIONS): **falham na `main`** e passam com a correção;
- 13 negativos (o preflight permanece pendente): GET sem cancelamento, erro de rede real, bloqueio, erro CORS, tipo divergente, principal não-GET, iniciador ausente, diferente ou de outro pedido, servidor sem resposta, resposta não liberada, principal concluído normalmente e `responded()` fora do estágio RESPONSE.

Regressão local (stubs só para `@tanstack/history`/`jsdom` ausentes no ambiente): `main` 508 testes, correção 523. O conjunto de falhas é idêntico nas duas versões (86, todas de ambiente/stub), e a única outra diferença é o teste de sucessão de nonce R7 → R8, que passa. A suíte completa é executada pela CI.

## Nonce e deployment

- Nonce de auditoria avançado para `integracao-v1-fase2-nav-20261113-r8`; R7 registrada em `spentAuditNonces`; PLAN R8 `78a5f4b` exigido como ancestral (`functionalNavigationR8PlanSha`).
- Não há alteração de produto. O deployment HML READY `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh` (fonte `3638cdd381cb911f6bdc115169891a25479b7a25`) continua válido, e os pins `NAVIGATION_DEPLOYMENT` permanecem inalterados (PLAN R8, item 4).

## Pendências antes de qualquer execução R8

Conforme a emenda de certificação incremental integrada: implementação e integração do ledger incremental (PR #627), revisão independente deste BUILD, REQUEST R8 de sete chaves com revisão canônica e execução Auth attempt 1 automática. Os índices 1-25 continuam candidatos a reaproveitamento e não estão certificados.

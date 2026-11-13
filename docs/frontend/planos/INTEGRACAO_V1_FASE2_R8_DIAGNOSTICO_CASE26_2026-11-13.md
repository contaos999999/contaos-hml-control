# Diagnóstico R8: evidências verificadas e critérios para correção do caso 26

## Fontes reais

- Workflow Auth R7: `43358055422`, attempt 1, job `131665158901`.
- Fonte BUILD R7: `3638cdd381cb911f6bdc115169891a25479b7a25`.
- HML: `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`.
- REQUEST R7 consumida: `integracao-v1-fase2-nav-20261113-r7`.
- Artefato privado R7: `14008077669`, ZIP SHA256 `c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3` (ainda requer inspeção de bytes/relatório).

## Observações comprovadas pelo log do job

- V110/1440: `PASS`, estágio `FINISH`.
- V110/390: durante `LINKS / LINK_CLICK` com destino `SYS04`, três registros `NAVIGATION_TRANSPORT` de `GET` API REST `fetch` com razão `ABORTED` por volta de 03:44:00 UTC.
- Cerca de dez segundos depois, `FAIL FENCE_DRAIN_TIMEOUT`; estado final `BLOCKED NAVIGATION_INCOMPLETE`.
- Índice real V110/390: 26 de 52, calculado a partir de `navigationCases()`; 25 PASS anteriores são candidatos, não certificados.

## O que os logs NÃO demonstram

Não é possível concluir apenas com os três abortos se o timeout deriva de requisição realmente ativa, ausência de evento terminal CDP, correlação incorreta de requestId/Fetch, geração de navegação, remount de rota, ou contagem residual do fence. Não suprimir `ABORTED` nem zerar contadores.

## Instrumentação mínima para diagnóstico posterior

Capturar, com campos não sensíveis e limites de cardinalidade: requestId pseudonimizado, geração, frame/loader, eventos `Network.requestWillBeSent`, `Network.loadingFailed`, `Network.loadingFinished`, `Fetch.requestPaused`, `Fetch.continueRequest`, terminação e decremento de active/pendingNetwork; snapshot final antes do timeout. Garantir nenhuma URL com query sensível, corpo de resposta, credencial ou identificador de paciente.

Criar RED determinístico reproduzindo evento terminal ausente ou associação CDP tardia; distinguir de requisição efetivamente não terminal. GREEN somente após provar a causa e demonstrar que falhas genuínas continuam fail-closed. A correção do fence deverá seguir BUILD independente da integração do ledger.

## Estado do BUILD incremental

PR #627 permanece DRAFT. Os módulos criados ainda não verificam ZIP, `report.json`, SHA256SUMS, ancestralidade, impacto entre commits, sessão/logout nem integração do executor; portanto **não autorizam retomada R8**, não podem promover os 25 PASS e não constituem certificado. Os testes unitários novos não substituem auditoria HML autenticada.

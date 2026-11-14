# Fase 2 R14: o "aborto" no logout é a resposta 204 do logout não lida pelo cliente

## Estado terminal R13, sem certificação

A Fase 2 continua NÃO CERTIFICADA. Cadeia integrada na `main`:
- PLAN R13: #646, merge `af594806939c834614d3b5c79b986d2dbd8c9963` (commit do PLAN `d01da7f`).
- BUILD R13: #647, merge `e0c02e49f99ae6ad1d00132249c9c98f0b5740ac` (nonce r13).
- REQUEST R13: #648, merge `49d23573db33009abbcb47dd33617dee988b2327`. A revisão canônica `5897583438` foi a última no HEAD, conferida pela API.

Execução Auth `43502004875`, attempt 1. Solicitação `132149933303` SUCCESS; privado `132150246933` FAILURE (`NAVIGATION_INCOMPLETE`). Guard nativo PASS (8 casos), proveniência pública PASS.

Artefato `14074148065` (`trilha-a-private-43502004875-1`, 1258 bytes): ZIP `sha256:4063b36ddf96972e9a0ce0a131fb127cdffd2c08a76ffa9da9fa6deedc2c9621`, CRC válido, dois membros, `SHA256SUMS` OK; `report.json` `289f48eec465a4901b867a4eada7a906071fe050353b2b4e1f5be0ec800f2758`, schema v4, ledger `2245b4fe…`, retomada 52.
- **Índice 52 (V123/390): PASS**, `FINISH`, zero erros na linha.
- Sessão, MASTER, organização e logout `true`; `fenceDiagnostic` e `logoutFailure` nulos; `pageErrors` 0.
- Globais: `transportErrors` 1 e `httpErrors` 1.

Marcadores da instrumentação R11, enfim emitidos:
- `NAVIGATION_SESSION_TRANSPORT_PHASES`: `beforeLogout` 0, `afterLogout` 1, `afterTeardown` 1. O erro é **do logout**.
- `NAVIGATION_LOGOUT_TRANSPORT`: `POST`, endpoint `auth:logout`, `ABORTED`, frame principal, sem navegação de documento, iniciado 30 ms e falho 123 ms depois da etapa de clique.

R13 está consumida, sem rerun, replay nem reuso de nonce. O índice 52 continua pendente no ledger.

## Causa provada em Chromium real

`supabase.auth.signOut()` envia `POST /auth/v1/logout`; o GoTrue responde **204 No Content** e o cliente não lê o corpo (`noResolveJson`). Experimento em Chrome real (`/usr/bin/google-chrome`, `playwright-core`), com servidor local sintético:

| Resposta do POST | Corpo lido pelo JS | Navegação SPA depois | Evento do Playwright |
|---|---|---|---|
| 204 | não | sim | `response` 204, depois `requestfailed` `net::ERR_ABORTED` |
| 204 | não | não | `response` 204, depois `requestfailed` `net::ERR_ABORTED` |
| 200 vazio | não | não | `response` 200, depois `requestfailed` `net::ERR_ABORTED` |
| 200 com corpo | não | sim | `requestfinished` |
| 204 | sim (`text()`) | não | `requestfinished` |

Em três repetições, a ordem foi sempre `response` 204 antes de `requestfailed`, com `responseBodySize` 0. O Chromium marca como `ERR_ABORTED` a carga de uma resposta vazia que a página não consumiu, **depois** de a resposta HTTP ter chegado. O logout foi concluído no servidor (204); não há defeito de produto nem sessão ativa remanescente.

Scripts (SHA-256): `logout.mjs` `705e5a5a…`, `nonav.mjs` `39c4df50…`, `read.mjs` `ae900272…`, `order.mjs` `3acc272d…`.

## BUILD R14

1. **Classificação com prova, no observador da sessão** (`observeNavigationSession`): um `requestfailed` só deixa de contar como erro de transporte quando **todas** as condições valem para o mesmo pedido:
   - método `POST`, origem da API e caminho exatamente `/auth/v1/logout`;
   - falha `net::ERR_ABORTED`;
   - evento `response` com status **204** recebido antes, para esse mesmo objeto de pedido.

   Nesse caso o pedido é contado à parte (`completedEmptyLogout`) e emitido num marcador fechado. Qualquer outro `ABORTED`, inclusive no logout sem 204, continua erro. Nada muda nas linhas da matriz, no fence, nos prazos ou no veredito de um caso.
2. **Nonce** `integracao-v1-fase2-nav-20261113-r14`, R13 consumida, este PLAN como ancestral.
3. **Compatibilidade:** o logout não ocorre dentro de nenhum caso; os PASS 1-51 da R10 (`050beb1`) continuam compatíveis. Ledger, produto e deployment inalterados.

## Consolidação

Se a REQUEST R14 fechar limpa, a PR de consolidação grava o índice 52 com a evidência da R14 e emite o certificado, registrando a R9-R13 e esta causa, conforme o PLAN R11.

## Proibições

Continua proibido ignorar `ABORTED` sem prova, suprimir `requestfailed`, zerar contadores, relaxar prazos, o guard nativo ou o fence; reutilizar nonce; alterar produto, backend, SQL, RLS, RBAC, Auth, Storage, Edge, segredos, YAML, lockfile, branch protection, `types.ts` ou PROD. PLAN, BUILD e REQUEST por merge commit; revisão canônica por último.

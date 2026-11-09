# Prova local da primeira rede de popup

Baseline2486d8c57847804ef198babd4c9acb07f75f0462. Sem Auth/HML/SQL, sem editar fonte. Três diagnósticos temporários usando módulo original, canárioHTTP127.0.0.1 próprio, observer passivo de CDP e contadoresTCP/bytes/GET. Nenhum header/body/raw privado salvo.

Arquivos e execuções:
- original.mjs → proof-original.json, cmd_6acf6c1c2d0d48acaf7d8592a527:3trials,dois vazamentos GET644bytes e um0. Não declarar determinismo desse timing.
- delayed-close.mjs → proof-delayed-close.json, cmd_1afaef5f5e074b48b6b9126cd60b:callbackclose100ms temporário,3/3GET644bytes. Não modifica o módulo original.
- context-route.mjs → proof-context-route.json, cmd_61e051c00aa94db4aa0ef5440276:route awaitedantescerca +mesmodelay100ms,3/3TCP/bytes/GET0,routeABORTfilho eFENCE_POPUP. É experimento, não GREEN do guard integrado.

SHA256proofs: original f2bfa75892555e54dbff4c7bc73714a996f8659c31a145d9bd855d61927712b3; delayed4701b027b7107a49dcde68534d566951f431ec17302d080b1348463b32472051; route77db4a788b7da9ba4d8f47192ea8cc48eaa18587726fced85a113f42a147af97. Bytesoriginais recuperados em partes do Sandbox e hashes recomputados independentemente antes do GitHub.

Os scripts são forense local, não testes CI assertivos ou rotina HML. Layout/vercel/sys04-native-baseline e dependências originais (Node24.22.1/PW1.58.2/Chromium1208), sandboxtrue. Não executar como auditor de produto. status/diff e hashes dos dois mjs baselines conferidos no cmd_5abcf1077a114f368d3410a0b2f8; auditorSHAa12de44e24339bc935d99fa548ca4dcecb57490450d26ed2be0302726c8b372b e testSHA53b9f352697ba82bf0f514471825da9ce5e716ff73cb624cdd95e68c9d0cb482 batem com GitHub.

A chamadaPage.windowOpen→invalidate ocorre antes deHTTP noRED; closeContext retorna depois. Toda reprodução continuaFENCE_POPUP. Produção usa proxy adicional invariável; nenhumproxy foi usado para esconder falha nesses diagnósticos. Correção futura precisa8nativecausais e navegação principal real sobCDP, além de0TCPinalterado. A documentação oficial orientaBrowserContext.route para primeira requestpopup, não listenerPage tardio: https://playwright.dev/docs/api/class-browsercontext#browser-context-route .

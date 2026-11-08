# PLAN P0: comprovar o ciclo nativo de requisições interrompidas

**Objetivo:** concluir a auditoria184 pendente com cerca forte, preservando24provas históricas e artefatos parciais. Regular75/V1-23, atômico000/NFR085–096. Execução direta pelo mesmo executor e revisão independente. Nenhuma nova autorização humana necessária dentro do escopo expresso do titular.

## Baseline e hipótese ainda não comprovada

BUILD356 integrado e21970aae502deee8236644a6d5ee2cc76c1eafd; HEADb7b113ea, CI42501372087ZeroDrift/42501372057protocolo+nativo7/42501372043LOCKSUCCESS.114testes,produto1165PASS,tsc/lint/formato/revisão. GATE35553f9edd e checkpoint efetivamente relido no merge, blobfa7bc88b301a867cd94c3aa3cf889f98ab7909c3.

Run42501639458/job128795459654/artefato13626310122: ZIP6d132c2df9de8a2955c59c97900485351c66d6ca7c8411e38aebb51690735472/report8c3192e2ce013dc820dca7b2658f76cb057fdf13391b59e2fdc0fe4ff25c3981;124/124hashes,82PNG/41DOM.41PASS novos parciais (SYS05/ADM01/V101/V102/V103×8+V1041440claro);24baselinepreservados;8SYS04PII;1CDP+110interrompidos+24fixture. Logoutfalse. Falha observada Fetch.continueRequest, código-32602/INVALID_INTERCEPTION, semredirect/worker/popup/destinobloqueado. Não é prova de cancelamento, nem DoD.

Hipótese: uma requisição é cancelada pelo próprio navegador entre o evento pausado e a continuação. Comprovar antes de implementar tratamento. Revisão exige identidade inequívoca e evidência terminal nativa; erroCDP sozinho nunca autoriza exceção.

Fontes primárias: https://chromedevtools.github.io/devtools-protocol/tot/Fetch/ e https://chromedevtools.github.io/devtools-protocol/tot/Network/ (Fetch.networkId correlaciona Network.requestId; loadingFailed distingue canceled). Conferir contrato e versão Chromium1208 fixada, sem atualização de dependências.

## Arquivos e proibições

BUILD futuro somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs; documentos destePLAN/GATE, PLANO_ATIVO e checkpoint. Sem produto/workflow/RPC/API/SQL/schema/Auth/RLS/Storage/PROD/tipos/dependências. Não remover controles nem aceitar resposta não verificada. Sete provas nativas existentes obrigatórias e preservadas; acrescentar oitava prova específica, elevando atestado exigido7→8 com testes de rejeição do atestado incompleto7noHEADnovo. Histórico de7permanece vinculado aoSHAantigo.

## Tarefas com saída verificável

- [ ] PLAN CI/revisão e integração; GATE separado com CI/revisão antes do RED.
- [ ] RED de ciclo individual: Network.requestWillBeSent com requestId/frameId/loaderId/tipo/URL/método associa-se inequivocamente ao Fetch.requestPaused com networkId/frameId/sessão/target/generation. Contêineres nativos já verificados. Redirect, ID reutilizado/duplo pause ou associação divergente não produzem prova. Mapas limitados e limpos ao término/contexto.
- [ ] RED Chromium real sem credenciais: proxyWebSocket LOCAL de teste encaminha CDP ao browser fixado, retém exclusivamente o comando inicial Fetch.continueRequest de uma requisição própria; AbortController da página cancela-a; registrar somente metadados de ciclo controlados, observar evento terminal REAL e liberar o comando original para reproduzir INVALID_INTERCEPTION. Endpointcanário não pode receber bytes da requisição cancelada. Proxy não existe no runtimeHML.
- [ ] Negativos: erro sem evento, canceledfalse, erro/tipo/ID/sessão/target/frame/loader divergentes, cancelamento de outro request, IDreutilizado/redirect/segundopause, falta de contexto; resposta adulterada continua sem executar/transmitir. Teste não pode fabricar evento nativo positivo.
- [ ] Só com RED demonstrado, implementar máquina de estados limitada: eventual descarte exclusivamente de erro exato-32602/INVALID_INTERCEPTION do comando inicial Fetch.continueRequest após prova terminal Network.loadingFailed canceledtrue/errorTextnet::ERR_ABORTED e identidade completa correspondente. Não aplicar a getResponseBody, continueResponse, fulfillRequest, política, proveniência ou erro genérico.
- [ ] Sem retry, corpo alternativo ou continuação subsequente daquele request. Eventos tardios/ambíguos mantêm failclosed. Se for necessário aguardar terminal, janela fixa máxima250ms desde erro enquanto nada é liberado; expiração fecha contexto, sem aumentar timeout de navegação/CDP e sem loops de tentativa. Exceção não é para erro desconhecido, apenas para request comprovadamente encerrado antes de qualquer corpo liberado.
- [ ] Persistir somente contador bounded/código fechado; IDs/URLs/dados ficam na memória e nunca nos logs/artefatos. Prova insuficiente mantém falha original.
- [ ] GREEN todosunitários+8nativos, 7existentesintactos, versão/arquivoSHAidênticos, lint/formato/tsc/regressão/LOCK/ZeroDrift. Revisão independente e mergeCAS normal, sempushmain.
- [ ] TesteC main/HMLREADY/proveniência exata, somente pendentes, artefatos SHA256 e logout. Examinar resultado antes de alegar causa/resolução. Se erro de corpo reaparecer, permanece bloqueado e requer diagnóstico próprio; não estender exceção.
- [ ] Atualizar checkpoint integrado/relido e continuar SYS04/24fixtures/72critérios/350semrepetir18públicos/24históricos nem certificar V1 semDoD. As41provas novas permanecem parciais até revisão e critérios de saída.

## Rollback e ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Rollback por PR dos doisarquivos; preservar artefatos e todas as provas. Semmodificar marca/CSS/rotas/backend/segurança. GitHubdireto semBUILD Lovable. Escopo técnico do planejamento PRD/premissas/arquitetura/atômicos/brand/NFR/ZeroDrift/TDD/CIplanejada/TesteC/rollback conferido; CI/revisão destePLAN ainda necessários.

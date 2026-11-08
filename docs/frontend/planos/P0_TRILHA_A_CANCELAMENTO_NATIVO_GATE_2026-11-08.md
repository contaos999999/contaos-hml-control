# GATE P0: ciclo nativo fechado, oito provas e nenhuma continuação alternativa

PLAN357 integrado29f1c3e4bfc1e4f3a561c4a08412922e00a01007; HEADddfa1472, CI42502594842/42502594830SUCCESS e revisão independente. Backend3ef22a3,25fontes/catálogoiguais. Referências: issue317, rodada56/41PASSparciais preservada,24baseline/18públicos válidos,24fixtures específicas ainda pendentes. V1NO-GO.

## Contrato executável, condicionado à CI/revisão deste GATE

Arquivos futuros somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Documentos: PLAN/GATE, PLANO_ATIVO e checkpoint. Semsrc/public/workflow/dependências/backend/PROD. Não ampliar destinos/RPCs, retirar CSP/TLS/sandbox, aceitar3xx, código/corpo diferente, ou aumentar timeout por tentativa.

### Identidade e máquina de estados

- Capturar frame raiz por leitura Page.getFrameTree antes de liberar o renderer; este único comando de leitura pode entrar na allowlistCDP. Validar estrutura/string de ID e não persistir identificadores.
- Network.requestWillBeSent registra somente na memória: sessão/target próprios já validados, networkId, frameId, loaderId como geração imutável, tipo, URL/método e timestampmonotônico. Fetch.requestPaused liga seu requestId único ao networkId correspondente, mesmo frame raiz/sessão/target/tipo/URL/método/geração.
- O vínculo deve existir semredirect/reutilização/duplicação. Requeststage somenteum; resposta não pode ter sido observada antes da exceção. Novo loader identifica outra geração; não reutilizar associação anterior. Mesmo que navegação mude, a prova terminal pertence apenas à requisição original, jamais à nova.
- Estado inicial PAUSED → CONTINUE_SENT → CONTINUED somente apósack; response/finished/failed/canceled são terminais para elegibilidade. Um request encerrado não pode voltar a emitir continue/fulfill. Erro de política ouproveniência não é elegível.
- Mapas de requisições ativas até1024; tombstones de networkId/FetchID consumidos até65536 porcontexto. Excesso/duplicidade/associação ambígua fecha contexto. Limpar registros de rede concluídos quando não houver pause emprocessamento; manter terminal de cancelamento apenas até resolver o pause associado; tombstones atéfecharcontexto. Fecha resolve pendências como falha e limpa mapas/timers.
- Network.loadingFailed só comprova cancelamento se canceled===true, errorText==="net::ERR_ABORTED", tipo e networkId exatos da mesma sessão, timestampfinito >=início e semblockedReason/corsErrorStatus. Demais eventos nunca geram autorização. Eventos de outrotarget/sessão/request/geração e eventos repetidos não podem satisfazer a prova.
- Só tratar erro exato code-32602/enumINVALID_INTERCEPTION/métodoFetch.continueRequest noestágioinicial, semack/resposta/corpoliberado. Se necessário, aguardar uma única janela fixa250ms pelo terminal nativo correspondente enquanto nada é liberado. Semprova inequívoca, expiração ouambiguidade = falha fechada original.
- Tratamento = descartar apenas a tentativa de continuação de requisição comprovadamente encerrada antes de resposta. NUNCA repetir comando, tentar alternativa, liberar corpo, chamarcontinueResponse/fulfill ou aceitar getResponseBodyfalho. Essas falhas permanecem fatais. Persistir somente contador bounded de cancelamentos comprovados e enums/códigos atuais; nunca IDs/URLs/mensagens/corpos/headers/tokens.

### RED nativo obrigatório antes do tratamento

Acrescentar oitavo teste Chromium real usando browser1208/sandboxtrue. ProxyWS LOCAL de teste encaminha protocolo original ao navegador e retém exclusivamente o comando inicial de um fetch próprio; AbortController cancela no renderer; o proxy entrega evento terminal REAL sem fabricar/alterar evento ouerro e então encaminha comando retido. O navegador deve produzir o erro observado. Verificar identidade/ciclo e zero bytes/conexões ao endpointcanário cancelado. Proxy só existe no teste, nunca noHML.

RED deve primeiro comprovar o erro nativo e encerramento indevido da cerca atual. Se não reproduzir combinação, não implementar exceção por inferência: coletar somente diagnósticos de ciclo fechados e reavaliar. Um teste mockpositivo não substitui esseRED.

Negativos unitários executáveis: errosemterminal; canceledfalse/errooutro/blocked/cors; timestampinválido; networkId/FetchID/session/target/frame/loader/tipo divergentes; IDreutilizado/redirect/segundopause; resposta jávista/ackjárecebido; evento deoutrarequisição; getResponseBody/continueResponse/fulfill/política/proveniência. Todos continuam failclosed semcanário. Respostaadulterada continua proibida mesmo após cancelamento benigno anterior.

### GREEN, atestado e teste real

Sete provasnativas existentes permanecem intactas e obrigatórias; oitava específica é adicional. nativeProofFromTap/nativeProofValid passam a exigir exatamente8testes/8PASS/0FAIL/0SKIP noHEAD/hashatual. Testes recusam7e9, falha/skip, falta/duplicação de contagens eSHAdivergente. Não recategorizar prova antiga nem esconder falha.

Conferir8nativos/negativos, regressão1165oumais,tsc/lint/formato, LOCK8ea7750b75fd9d76b29c36ce7613392e3ab65e19,ZeroDrift e revisão independente antesmergeCAS normal. TesteC HMLREADY/paridade110módulos/SSR antessecrets, somente pendentes, screenshots/DOM/SHA256 e logout. Artefatos abortados permanecem parciais; não certificar por contagem. Backend/PR139não presumidosbloqueadores.

## Rollback e ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Rollback por PR dos dois arquivos novos deexecução; preservartodasasprovas e registros históricos. Semproduto/marca/tipos/rotas/backend/PROD. GitHubdireto, semBUILD Lovable. Gates planejamento PRD/premissas/arquitetura/atômicos000/085–096/Brand/segurança/NFR/ZeroDrift/TDD/TesteC/rollback conferidos; CI/revisão ainda obrigatórios antes de BUILD. Continuar184 atéDoD integral, incluindoSYS04,24fixtures,72critérios e350, semrepetir18públicos/24históricos válidos.

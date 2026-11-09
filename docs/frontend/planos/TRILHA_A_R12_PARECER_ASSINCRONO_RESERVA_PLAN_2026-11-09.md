# PLAN R12: parecer assíncrono e reserva da intenção R11

Issue #317, prioridade0. Base main b5dbef9b03155daf16182ae5aa450fd89bdab380. Este PLAN documental não libera BUILD, Auth, SQL ou request. Exigir CI/revisão/merge do PLAN e depois GATE separado. Objetivo: preparar24fixtures para liberar184pendentes, sem certificar V1/208/232/72. Preservar C13, sourceproofs históricos e Run124204PNG/102DOM/307hashes verificados.

## Evidência e contrato de origem

R11 original42650825191/attempt1/head7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e terminou FAILURE; artifact13690462160/18064B/ZIP SHA256eb445aadc6876e116040946157c2c4a1bd6bfd79f494945649dbd63e6d74eb50. Inspeção original42653576661/job129286042067 SUCCESS, exatamente uma prova;18/18hashes/tamanhos conferidos independentemente.

Report3404/SHAfcee36850806601be988dedf4afe49fe10e6fccc6640f2b7e0a63a870541dc1a: PHASE_TIMEOUT/COMPETENCY_GET, faseFINAL_READBACK, reconciledtrue, completedfalse, logouttrue/cleanupnull. Receipts1303/SHA603a302a92902da2978ddabb20d7972dd9713d39d8838024bfaa89cfb1af33e8: solicitar_parecer_interno requestaf968191-7d60-4adb-9c60-ebd5f0741e8e/payloadb8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d, SEALED seguido de UNCERTAIN. Observation280/SHA59eb0943c77cbcc75e0e022d3ebb75cc74384faf73c5f64e6b5dc2cb29059a47: firstFailure=null não certifica sucesso. Ledger original count11/priorConfirmed10/newArmedCount1/frozen+pending+senttrue/maxNew14 permanece imutável.

Fontes congeladas do produto437c788e32f0325dd15c9d2e7277c10129bcb462:
- src/components/competencias/CompetenciaParecer.tsx, blob383ca5bba06d3d5533738ceb05da246f564f3303.
- src/lib/competencias/parecerInternoDados.ts, blob7d2439c6a89b8918154a03fc9bc3cc226e9d083a.

Backend contaos999999/develop em5eca44aebead3183e81b5c1af0d1dffa5fb8feb6:
- supabase/migrations/20261106014102_p0_v1_rbac_persistente.sql, blobc02f209c5139ac6c132ed153b39de440d62e24e5: solicitar_parecer_interno retorna v_job de enfileirar_job para gerar_parecer_interno.
- supabase/functions/queue-worker-ai/index.ts, blob35ae213e6715d4a176162a277901dd2f7c32d3e5: o worker produz id_parecer independente do job, autor:null/statusrascunho/versão incrementada/hash.

O consumidor atual exige indevidamente row.id===ACKjob. A UI faz um recarregar no finally; a barreira atual pode impedir que o consumidor alcance o poll/Atualizar já existente. O descompasso de identidade e ordenação é demonstrável em fonte; a linha corrente R11 e a causalidade individual do worker não foram exportadas pela prova. Não inferir que o job gerou determinada linha, nem que a solicitação falhou no servidor.

## Recuperação e orçamento fechados

Documento contaos.fixture.recovery-r11.v1 obrigatório antes login/armamento e em todos os consumidores de recuperação/broker/runtime: blobaf4a3ca0b5017d4a422de41564063d4c82293f72,6130ASCII/canonicalpretty2+LF/SHA25629f674764a2c8f953f764fcb6a40d8c330e441b488dfcab56a6ee4f9f389c423. Doze campos próprios ordenados: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw. Validar pins, tipos, ordem, canonicalização e três raws/hashes originais; negar accessor/getter/símbolo/Proxy/protótipo hostil antes de efeitos.

Modelo futuro intentLedger com nove chaves nesta ordem: count,frozen,pending,sent,priorConfirmed,priorReserved,newArmedCount,maxIntentions,maxNewIntentions. priorConfirmed=10,priorReserved=1,base11,count11..24,newArmedCount=count-11 em0..13,maxIntentions24,maxNewIntentions13. Flags do broker futuro são reais; não fabricar pending/receipt corrente para representar reserva histórica. recovery conserva dez campos e confirmedBefore10/maxNewIntentions13, derivando reserva do ledger. Não reescrever reports antigos ou transformar reserva em confirmação/reembolso.

Incluir af968191-7d60-4adb-9c60-ebd5f0741e8e nos usedIds e negar semanticamente solicitar_parecer_interno para Oct permanentemente, inclusive com novos UUIDs/requestIds e mesmo quando a linha não for comprovada. Todas as dez negações anteriores permanecem. R11 UNCERTAIN nunca é promovido por um GET posterior. R1–R11 gastos; nonce futuro trilha-a-fixtures-20261109-r12. Recibos atuais até26linhas/13pares novos; CAU2/contagem corrente consideram somente newArmedCount, sem recibo corrente fictício da reserva.

## Reconciliação Oct antes de qualquer novo armamento

Usar somente UI/GET ordinário já autorizado do SDK de parecer: select exato, três eq de contexto, ordenação versão/id descendentes,offset0/limit25. Exigir resposta concluída fresca do observador e contexto de todas as linhas; escolher uma única versão máxima, UUID/hash64 válidos e statusrascunho ouaprovado com aprovado_em coerente. Ausência, projeção parcial, duplicidade/ambiguidade, contexto ou estado desconhecido bloqueiam antes authorizeRecovery e ANYnewarm, sem nova solicitação.

A prova interna deve ser selada pelo broker/observador corrente, vinculada ao documentoR11, geração, contexto e fingerprint da linha; contradição posterior invalida a autorização. Prova de estado permite reuso da linha e seus papéis de IDs/versão/hash, sem atribuição causal ao job histórico. Não aceitar booleano/DTO externo ou cache pré-barreira como prova. Preservar omissões de autor/texto/aprovado_por e limites existentes.

## Nova solicitação assíncrona somente Sep

Para solicitar_parecer_interno novo de Sep, usar a request mutante exata selada e resposta admitida HTTP2xx com UUIDACK no observador real. confirmAfter(value) retorna true por QUEUE_REQUEST_ACCEPTED, sem fazer GET ou esperar linha antes do poll. Isso confirma aceitação da solicitação na fila e consome seu slot permanentemente; não confirma worker, parecer pronto ou conclusão de negócio.

Somente o predicado desse RPC pode aceitar GET próprio pós-ACK, com query SDK exata, resultado vazio válido ou linhas válidas; não exigir row.id===ACKjob. PreACK/cache/contexto estrangeiro/projeção parcial ou pendente permanecem fatais. O poll/Atualizar UI já existente, separado, observa a linha corrente para continuação, sem afirmar causalidade de job. Se não houver linha pronta no prazo existente, falhar sem reenfileirar, sem reembolso do slot e sem repetir a solicitação. Não alterar confirmação de outro RPC, matcher/default, listeners, transporte, timeout ou retry.

## Escopo e verificação

Futuro BUILD limitado aos quatro mjs existentes:
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs

Sem SRC, SQL, endpoint/GET adicional, appdeps/lock, YAML, types, RLS/grants, AuthAdmin/service_role, PROD, fábrica/fence ou relaxamento global de projeção/segurança.

RED antes de produção: observador/consumidor reais com ACKjob diferente de parecerID; GET vazio pós-ACK não bloqueia o poll e não certifica prontidão; linha corrente provada permite continuação sem joinjob inventado. Negativos para ACK inválido, request divergente, préACK/cache, query/contexto/versão/hash divergentes, resposta parcial, ambiguidades, timeout e replay Oct com UUIDnovo. RecuperaçãoR11 inválida/ausente bloqueia todos os entrypoints antes login/arm; prova externa/reutilizada/contradita não autoriza; orçamento10confirmadas+1reservada+13novas exato, sem promoção histórica. Preservar CAU2, firstFailure6/4, fatal consistency e todos os limites.

Preservar17nativas e basepassed8. Propor quinto suplemento sourceforms derivado das fontes reais, título EXATO "R3 Chromium sourceforms asynchronous opinion queue acceptance and actual opinion consumer", mantendo quatro anteriores em ordem; GATE fechará viabilidade/TAP1..5/tests5/pass5/failcancelledskipped0, retorno5 e total factual18=8+1+5+2+1+1. Não contar asserts/Node como nativas nem alegar execução antecipada. Caso a implementação exija outra organização, emendar GATE antes de alterar contagem.

## Etapas e leitor posterior

PLAN documental com CI/revisão/merge, depois GATE separado com CI/revisão/merge; somente então RED→BUILD4mjs, CIHEADliteral/independência/merge protegido. RequestR12 separado SOMENTEJSON7campos/nonceR12/pai real/blankpairAUTO_DISCOVER; checks/canônica/freshness e merge normal. Congelar main/deployment até upstream+dois subscribers originais attempt1 terminais; sem rerun/cancel/dispatch/Auth alternativo.

Writer futuro20dados+SHA256SUMS=21membros/HISTORY17: manter18nomes atuais em ordem e append somente receipts-r11.json/recovery-r11.json com hashes acima. Report15/diagnostics9/recovery10/observation6/4 e raws históricos preservados; somente ledger corrente passa a nove campos conforme contrato.

Após R12terminal real, leitor em PR separado somente os dois mjs existentes, pins reais/20dados/HISTORY17 e validação ledger9/recovery10, sem controlador genérico. Preservar políticas de download/FD/digest/toolpin/30s/envmínimo/captura/warnings/bounds/CAU2; CI/revisão/merge protegido antes da inspeção original pushmain read-only. Nenhum leitor manual de ZIP. Atualizar checkpoint com evidência efetivamente integrada.

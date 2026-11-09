# GATE R12: parecer assíncrono e reserva histórica R11

Issue #317, prioridade0. PLAN488 integrado a3e4efdb04fa4a168bb364560b8114fe16ae8d8c, PLANblob4568a285ee5845fb65bbfa22a425f3d7fb37d78a. GATE documental: BUILD somente após CI/revisão independente/merge protegido. Não autoriza Auth ou SQL. Base normativa5eca44aebead3183e81b5c1af0d1dffa5fb8feb6, produto437c788e32f0325dd15c9d2e7277c10129bcb462/deployment dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp; revalidar fontes vivas antes das etapas dependentes. C13/source_proof/contexto histórico/types8ea/catalog100/97 e25normativas preservados.

## Escopo e autoridade

Futuro BUILD somente:
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs

Sem SRC/YAML/SQL/endpoints/GETs novos/appdeps/lock/types/RLS/grants/PROD/AuthAdmin/service_role. Não alterar matcher/default global, listeners, fábrica, fence, transporte, timeouts/retries/política HTTP/body ou regras de negócio. Preservar kernelR10 de orçamento único15s/pendingrequests+body/seal3s, projeçõesR11RPC/path, firstFailure6/4/8stages/fatal consistency e17provas atuais.

Fontes produto437: CompetenciaParecer.tsx383ca5bba06d3d5533738ceb05da246f564f3303; parecerInternoDados.ts7d2439c6a89b8918154a03fc9bc3cc226e9d083a. Fontes backend5eca: migration20261106014102_p0_v1_rbac_persistente.sql c02f209c5139ac6c132ed153b39de440d62e24e5; queue-worker-ai/index.ts35ae213e6715d4a176162a277901dd2f7c32d3e5. Caminhos completos constam do PLAN. O RPC retorna jobUUID; worker cria parecerID distinto. Não usar99a3f6 como pin desse worker. UIrecarrega uma vez no finally e não reenvia automaticamente mutação.

## Evidência R11 e documento obrigatório

Original42650825191/attempt1/head7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e FAILURE; artifact13690462160/18064B/ZIP SHA256eb445aadc6876e116040946157c2c4a1bd6bfd79f494945649dbd63e6d74eb50. Inspeção42653576661/job129286042067:18hashes, exatamente uma prova.
Report3404/SHAfcee36850806601be988dedf4afe49fe10e6fccc6640f2b7e0a63a870541dc1a; receipts1303/SHA603a302a92902da2978ddabb20d7972dd9713d39d8838024bfaa89cfb1af33e8; observation280/SHA59eb0943c77cbcc75e0e022d3ebb75cc74384faf73c5f64e6b5dc2cb29059a47.
PHASE_TIMEOUT/COMPETENCY_GET/FINAL_READBACK, completedfalse/reconciledtrue/logouttrue/cleanupnull/firstFailurenull. Histórico ledger8chaves count11/priorConfirmed10/newArmed1/maxNew14/frozenpendingSenttrue. SEALED→UNCERTAIN solicitar_parecer_interno requestaf968191-7d60-4adb-9c60-ebd5f0741e8e/payloadSHAb8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d. Isso não prova rowexistente, workerconcluído ou causa de uma linha corrente. firstFailurenull não é PASS.

Documento contaos.fixture.recovery-r11.v1, blobaf4a3ca0b5017d4a422de41564063d4c82293f72,6130ASCII/canonicalpretty2+LF/SHA25629f674764a2c8f953f764fcb6a40d8c330e441b488dfcab56a6ee4f9f389c423.
Doze campos próprios ordenados: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw. Fixar workflowRun42650825191/artifactId13690462160/requestIdtrilha-a-fixtures-20261109-r11/harnessSha7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e eZIP/trêsrawhashes acima. Validar tipos/ordem/canonicalização/SHA/origem, R11SEALED→UNCERTAIN exato, logouttrue/ledger/reserva antes de login, broker, reconciliação e TODOentrypoint de recuperação/armamento. Sem accessor/símbolo/Proxy/revoked/protótipo hostil; zero getters/traps/efeitos antes validação. Não tornar opcional nem aceitar crossproof.

## Orçamento corrente e reserva imutável

Ledger CORRENTE exatamente nove chaves nesta ordem: count,frozen,pending,sent,priorConfirmed,priorReserved,newArmedCount,maxIntentions,maxNewIntentions.
priorConfirmed=10; priorReserved=1; maxIntentions=24; maxNewIntentions=13; count=11+newArmedCount, newArmedCount inteiro0..13, count11..24. Flags correntes representam estado real do broker novo. Reserva histórica não cria pending/receipt corrente fictício. recovery conserva dez campos e confirmedBefore10/maxNewIntentions13, derivando reserva do ledger/documentoR11, nunca promovendo-a a confirmação.

R11UNCERTAIN permanece reservado e gasto para sempre neste ciclo. Não promover, reembolsar, reescrever ou reconstruir recibos/raws históricos. usedIds inclui af968191-7d60-4adb-9c60-ebd5f0741e8e. Negação semântica permanente de solicitar_parecer_interno para Oct50c26274-a36f-48e0-b2fe-5a1caf5d6a49, inclusive UUID/requestIdnovos, linhaausente/falha/estadoinconclusivo. Dez confirmações e todas as negações/documentos R1–R10 preservados. Novas intenções somente treze slots; recibos correntes até26linhas/13pares, contagem/CAU2 por newArmedCount exclui priorReserved. Ausência/incompletude permanece UNKNOWN, sem transformar reserva em newConfirmed.
R1–R11 gastos; nonce futuro trilha-a-fixtures-20261109-r12. Recibos/ACK não provam execução, idempotência ou job→parecer.

## Prova Oct antes de ANYarm

Antes de authorizeRecovery e de QUALQUER novo armamento, obter somente UI/GET já existente de listarPareceres:
select exato id,id_competencia,id_contrato,id_organizacao,autor,texto,status,versao,hash,criado_em,aprovado_por,aprovado_em;
eq id_competencia=Oct50c26274-a36f-48e0-b2fe-5a1caf5d6a49,eq id_organizacao=e87f7e68-c5ae-4077-943b-02a4afd8b6ee,eq id_contrato=be89ef7e-d839-46c0-9cfb-4da81edf8b74; order versao.desc,id.desc; offset0/limit25, nenhum extra.
Exigir request/response admitidos no observador corrente após barreira de request ordinal, corpo concluído/projeção completa do subset autorizado; todas as linhas no contexto exato. Não exportar/reter autor/texto/aprovado_por: omissões atuais mantidas. Selecionar versão máxima única: UUIDválido, versão safeinteger>=1/hash64, estado rascunho com aprovado_em=null OU aprovado com aprovado_em ISOválido. Duplicata deID/versão máxima, linhaforeign, partialquery, empty, stale/prebarreira, pending, hash/status/data inválidos ou unknown bloqueiam, sem novo pedido.

Prova interna opaca emitida/selada pelo broker/observador corrente; vinculada à identidade/documentoR11, contexto, geração/ordinal da resposta e fingerprint técnico da linha. Boolean/DTO externo, token forjado/reutilizado, outro broker/observer/contexto/run/documento ou cache antigo não autorizam. Contradição em nova leitura relevante do MESMOcontrato/query/contexto invalida antes do próximo arm; navegação/leitura não relacionada não deve invalidar por si só. Revalidar prova antes de ANYarm sem novos GETs forçados. Estado observado permite reuso/aprovação da linha, não prova causalidade do jobR11. Nunca inferir execução/parecerUUID pela chave do recibo.

## Nova solicitação Sep: aceitação de fila separada da linha

Somente solicitar_parecer_interno de Sep79bdc139-ed10-4c91-905e-b32b9a824d27 pode seguir novo fluxo. Exigir request selada imutável/nonce/contexto/payload exatos, resposta original HTTP2xx admitida pelo observador, ACKUUIDválido do job. confirmAfter(value) confirma QUEUE_REQUEST_ACCEPTED por esse ACK, SEMGET/espera de linha no callback. Confirmação do recibo significa aceitação da solicitação e slot gasto, não worker/parecer/conclusão. Se houver falha antes dessa prova, broker continuauncertain/fatal conforme contrato, sem retry.

Só o expectedReadback desse RPC pode admitir GETpostACK com a querySDKexata no contextoSep (mesmo select/order/range acima), resposta concluída com [] legítimo ou linhas contextuais tipadas. Request ordinal deve ser após response-start da mutação original, ACK publicado somente após corpo admitido, como binding causal existente. Nunca comparar row.id aACKjob. Empty é leitura admitida, NÃOprontidão nem confirmação de parecer; preACK/cache, queryextra/foreignscope, partial/pending/erro/ambiguidade/hash/status inválido não autorizam.

Depois do comando, poll/readOpinion/AtualizarUI EXISTENTES observam independentemente linha atual, com contexto/versão/hash/status coerentes e sem inventar joinjob. Manter orçamento único existente de300000ms para esse poll e ações/leitura sob o mesmo deadline; não aumentar/resetar timeout, não adicionar timer/retry/GET/cacheinvalidation/reload. O floor não pode impedir que [] postACK válido retorne ao poll; também não pode aceitar cachepréACK. Timeout permanece fatal; slot confirmado não é reembolsado e solicitação nunca repetida. OutrosRPCs/ACKpredicados/matcher/default continuam idênticos.

## RED e GREEN obrigatórios

RED causal antes produção, usando fontes reais/observador/consumidor:
- ACKjob≠parecerID válido; GETpostACKvazio permite poll sem prontidão, linha tardia contextual permite continuação, sem joinjob nem nova solicitação; HTTP/ACK inválido/requestbodydivergente/preACK/cache/queryfora/contexto/hash/versão/status/ambiguidades/partial/pending e timeout falham;
- R11mandatory em runtime/broker/todosentrypoints antes login/arm, missing/crossproof/getters/Proxy/revoked/symbol/ordem/hash/raw trocados zero efeitos;
- reserva10+1+13 exata, countbase11/max24/13pares/26linhas, flagsreais eUNKNOWNincompleto; R11não promovido/reembolsado; OctreplayUUIDnovo negadomesmosemlinha;
- provaOct inexistente/externa/forjada/antiga/outrocontexto/contradita não autorizaANYarm; freshuniqueválida admite reuso semgerarparecer; leitura não relacionada preserva prova, relevantecontraditória invalida;
- firstFailure/primary/CAU2/fatal consistency, readbarrier15s/seal3s/pendingbody/request e projeçõesV116/V117/nativasanteriores intactas.

Preservar17nativas atuais e nativeProof.passed=8. Quinto sourceforms EXATO "R3 Chromium sourceforms asynchronous opinion queue acceptance and actual opinion consumer", quatro títulos anteriores na ordem intactos. TAP1..5/tests5/pass5/failcancelledskipped0→retorno5; total factual18=8+1+5+2+1+1. Usar fábrica pinada, SDK/UIcontract/observer e opinion(c)/wrapper reais extraídos ou importados, loopback inerte; I/Oadapters/testfixtures explicitamente qualificados, nãofullHML/Master. Exercitar acceptedqueue+empty→refresh→row/negativepostACK e guardas de contexto/reserva, sem mock do predicado sob teste. Não contar asserts/Node como casosbrowser. CI deve registrar18literalSHAfinal, não transferir proof deoutroHEAD.

GREENmesmoscasos,Node/protocolos/helper30/produto/TS/build/ESLint/Prettier/Zero/LOCK/TesteC aplicáveis, revisão independente e merge protegido. Nenhuma execução Auth até request separado aprovado.

## Artefato e fases posteriores

Writer20dados+SHA256SUMS=21membros/HISTORY17: preservar18nomes atuais em ordem e append somente receipts-r11.json/recovery-r11.json com hashesraws acima. Report15/diagnostics9/recovery10/observation6/4 intactos; apenas ledgerCORRENTE9chaves. Históricos8/9chaves mantidos rawbyte/hash, sem normalizar retroativamente.

Após BUILDverde/revisado/integrado, request separado JSON7campos/fixtures/nonceR12/approved_parent_sha real/blankpairAUTO_DISCOVER. Doischecks/canônica pinned/freshness e merge normal; freeze main/deployment até upstream e dois subscribers originais attempt1 terminais. Sem rerun/cancel/dispatch/Auth alternativo.

Após R12terminal real, leitor em PR separado somente scripts/hml/inspect-fixture-artifact.mjs e .test.mjs: pins reais20dados/HISTORY17, ledgercorrente9/recovery10; CAU2/currentconfirmed excluem reserva e desconhecido permaneceUNKNOWN. Nenhum leitor genérico/ZIPmanual/YAMLnovo. PolíticasFD/toolpin/digest/warnings/30s/envmínimo/captura/bounds preservadas. CI/review/merge protegido antes originalpushmainreadonly.

Atualizar checkpoint com fatos integrados. Preparar24fixtures não encerra184/208/232/72/V1. Preservar18públicos,Run124204PNG102DOM307hashes,C13 eprovasanteriores semrepetição injustificada.

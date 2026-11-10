# GATE R19: retomada final somente leitura

PLAN550 integrado2b6ab4f542c66309fb16d12f9998136641591f25, HEADretificadof5fba05efcb173b1bb547a4a071f4c19fbe3603f, CI42736268005/42736267992SUCCESS, reviews5835378788/5835394093 sem C/I. Escopo autorizado pelo titular, sem nova pergunta genérica. Este documento NÃO dispara Auth, request, negócio ou deploy. BUILD somente após CI/revisão/merge deste GATE distinto.

## Baseline e prova

OriginalR18 run42731273678/merge8d055951838fee29664563bed5ee26bac4f55bd8/artifact13725830880/31346B/ZIPSHAb68f2edd99a4ce6e4728b74a899cd39bb1ec96f0ecd42048cbbdbbc6d47fb7eb. Leitor548/merge815dce2a4015e2bb1b5ec23e70633537ab008e62, inspeção real42734294198/job129559618536SUCCESS, uma prova/28hashes/25históricos.

PHASE_TIMEOUT no overview posterior ao registro; logouttrue/cleanupnull. Duas operações CONFIRMED: aprovar_apresentacao UUIDdd8e544b-af5b-4e23-bef2-b7c9ae2d0096/payload1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976; registrar_apresentacao UUID40546f93-f8f4-4686-a78a-11aa3069eda7/payload1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a. Não repetir nem com UUID/fundamento diferentes. Preservar Oct/R17, R16 e reservas R11/R15.

Próximo orçamento:17confirmadas+2reservas/base19/teto24/maxNew5 teórico; execução R19 ZEROARMS, saldo5 intocado. Nenhum refund, GET promovido a confirmação ou simulação de ACK histórico dentro da sessão nova.

## BUILD fechado e interfaces

Somente os quatro mjs de scripts/hml: authenticated-visual-audit.mjs, authenticated-visual-audit.test.mjs, prepare-visual-fixtures.mjs e prepare-visual-fixtures.test.mjs. Sem SRC/public/YAML/types/deps/backend/SQL adicional/RLS/AuthAdmin/Storage/PROD/deploy/config.

Auditor exporta R18_RECOVERY_DOCUMENT/validateR18RecoveryDocument(input) e R18_REGISTRATION_CANDIDATE/validateR18RegistrationCandidate(input). Preparador importa/reexporta os validadores/constantes, adiciona resumeR18Bindings(io,sourceList) e modo interno readOnlyRecovery no broker. Driver R19 passa readOnlyRecovery:true LITERAL, sem ENV/request/argumento CLI que desative. Função retorna o shape existente {state,competencies}; nenhum campo público novo no report, diagnostics, observation ou nativeproof.

## DocR18 obrigatório e história imutável

Doze own-data strings ordenadas, protoObject ou null, sem Proxy/getter/symbol/extra, pretty2LF/frozen. Schema contaos.fixture.recovery-r18.v1, workflowRun42731273678, artifactId13725830880, requestId trilha-a-fixtures-20261110-r18, harnessSha8d055951838fee29664563bed5ee26bac4f55bd8, zipSHAcompleto acima; reportSha256/receiptsSha256/observationSha256 e os3raws originais. Canonical8003ASCII/SHAde5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac, Nodecrypto6756174697.

Report3911/SHA c3ef3286f2e49d17226f4b747188a6959b9dcc11997a3cae251cbd0d7dac4590; receipts2524/SHA1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77; observation280/SHAf03ea467e40803a792ac4606e35e8f15de5d2fd5746d72428eb732509c57662f. Verificar formatos, relações e4recibos exatos contra documento literal original. HistóriaR18 fica15+2+2/count19/max7; históriaR17 fica14+2+1/max8; anteriores byte/hashes intactos.

Validação mandatory antes de Git/API/ENV privado/bootstrap/browser/budget/broker/runtime/login e em verifySingleRequest/loadSingleRequestProof/recoveryBudget/createIntentBroker/createRuntimeLogin/withRuntimeLogin/reconcileR1Recovery/reconcileRecoveryCompetencies/reconcileRecoveryOpinion/prepareSourceAndList/prepareCompetencies/resumeR18Bindings/runFixturePreparation. Ausência ou hostilidade bloqueia antes de efeitos. Nenhum fallback para documento antigo.

Ledger atual9campos count19/priorConfirmed17/priorReserved2/newArmedCount0/maxIntentions24/maxNewIntentions5/flagsfalse. Recovery10campos confirmedBefore17/maxNew5. Writer conserva28nomes/25históricos e acrescenta receipts-r18.json2524/1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77 e recovery-r18.json8003/de5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac:30dados+SHA31/HISTORY27. Correntes própriosR19; receipts.json vazio canônico55B. Nenhuma exportação nova de PII/catálogo.

## Candidato administrativo fechado

Exatamente19campos próprios/enumeráveis na ordem abaixo; constantes string/int/bool exatas, protoObject ou null, sem Proxy/getter/symbol/extra, frozen. A validação NÃO transforma a origem administrativa em JWT/UI.

```json
{
  "schema": "contaos.fixture.registration-candidate-r18.v1",
  "provenance": "ADMIN_LOOKUP_NOT_JWT_UI_PROOF",
  "projectId": "gklhhhyosgasnyoxlrui",
  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",
  "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
  "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
  "month": "2026-09-01",
  "competencyId": "79bdc139-ed10-4c91-905e-b32b9a824d27",
  "presentationId": "eb6d5b1c-8b64-418b-aa82-bf1f29d41768",
  "packageId": "f29715a6-0664-415a-8903-68be9d7c5d66",
  "packageHash": "82e0dc9adfbbce6956f87dfe8b78230f71eb9d7e4399571f86210c0f1c6e5c81",
  "packageNumber": 1,
  "packageStatus": "apresentado",
  "packageFrozen": true,
  "packageItems": 1,
  "protocol": "HML-TRILHA-A-20261108",
  "presentationMethod": "Ensaio sintético em homologação.",
  "sourceCheckpoint": "contaos999999/develop#138:6756125670"
}
```

Única rota SSR adicional: /competencias/79bdc139-ed10-4c91-905e-b32b9a824d27/apresentacoes/eb6d5b1c-8b64-418b-aa82-bf1f29d41768. Prova pública REAL source0024/deployment8FQ/HTML/módulos antes secrets; sem atribuir proof.documents artificialmente. goKnown com a mesma barreira15s/guards/fresh/drain/fence e documento aprovado. Sem goto ou fetch privado paralelo, discovery/listagem nova ou query livre. Preservar SDKV120/protocoloDados2d543e3d4dba2f63ac85ebba7707b83cd9d89bb6 e componentee61476d7b6a1bc548bceb8317ba2758d1ded60f2 do produto0024.

## Sucessor causal do registro

FULLCHAIN offline6756125705 prova a contradição do observador original30f2c79f3f03cdba5465d7ceb9bb748792fb3fa2. Acrescentar somente target VG contextual a readbackTargets(registrar_apresentacao) e predicado próprio em expectedReadback. Não alterar o predicado estrito de aprovar_apresentacao nem seus ACK100/pode/contexto.

Sucessor exige mutação registradora admitida, ACKUUIDválido, competência/org/contrato exatos, três readbacks pósACK da MESMA mutação validados e nova VGaguardando_contratante/snapshot100 posterior às provas. Apresentação tem idACK/protocolo/forma/contexto; pacote pertence à apresentação/competência/owner, hash válido/congelado; itens do mesmo pacote e contexto completos. Ausência/foreign/stale/pending/parcial ou VGantes3 bloqueiam sem fallback. Não confiar só na ordem do driver; usar observações/floors/ordinais reais da mesma instância. Conservar três targets de tabelas, validação readPackage e deadlines. Não apagar/relaxar floors, aceitar estado futuro na aprovação, aumentar timeout ou criar resposta sintética.

Este ajuste descreve a transição DENTRO de uma sessão com mutação. A retomada readonly histórica NÃO arma/injeta mutação ou ACK para satisfazê-lo: combina DocR18 confirmado com leituras novas abaixo.

## Retomada e zero negócio

resumeR18Bindings valida todos documentos/candidato antes de efeitos, reaproveita reconciliação readonly de fonte/lista e os selos atuais de documentos/análise/parecer dos dois meses. IDs de histórico só entram após readbacks atuais de seus relacionamentos, owner/generation/source/deployment nativos. Oct50c26274-a36f-48e0-b2fe-5a1caf5d6a49 deve permanecer pode_apresentar_contratante/100; Sept79bdc139-ed10-4c91-905e-b32b9a824d27 aguardando_contratante/100.

Abrir rota candidata aprovada e observar a UI original: obter_visao_geral_competencia e três GETs originais de consultarProtocolo (apresentacoes_contratante, pacotes_competencia, itens_pacote_competencia), selects/filtros/paginação já permitidos. Exigir ACK históricoDocR18, IDs candidatos, owner e escopo exatos, protocolo/forma, pacote/hash/número/status/congelamento e item realcontextual/total1. Leitura administrativa isolada, UUID sem acesso, dado vazio/múltiplo/pending/foreign/stale/contraditório bloqueia. Não repetir SELECT administrativo, RPC de negócio, revisar material, criar documento/competência, aprovar/registrar ou replay idempotente para recuperar UUID.

Outputconfirmed somente após provas atuais; dois registros mensais com id/requirementId/documentId/executionId/opinionId comprovados, estados próprios e flags de fatos comprovados. Sept inclui presentationId/packageId/packageHash/packageState. Não forçar allowed_actions.apresentar em Sept já registrada. Driver não chama o pipeline mutador, somente resumeR18Bindings. completedtrue exige fontes/lista/bindings/finalreadback e logouttrue/cleanupnull. Binding NÃO equivale a catálogo de texto/data/PII para capturas.

readOnlyRecovery:true fecha arm antes de persist/contador/rede e policy nega BUSINESS_RPCS REQUEST OPTIONS/POST e RESPONSE não admitida, independentemente de authorizeRecovery ser chamado por engano. Modo imutável no bootstrap, sem escape por ENV/default. Default dos consumidores históricos de teste preservado sem ampliar políticas. Nova baseline19,0novosrecibos,0businesscontinuations; qualquer divergência reprovaR19.

## Vetor técnico e TDD fechado

Vetor positivo técnico V117 comprovado em6756371318 no runtime original79a05faaa5a0ad5f35c782e5cf796da6431e2da1, sem patch: validateBusinessPayload+broker.arm+policiesOPTIONS/POST/RESPONSE+resolveconfirmed,1/1PASS. Usar registrar_revisao_requisito_v117 com shape original vectors~716, contextoOct deDoc16 e projeções originais r17RecoveryData/r11SqlV116, camporesultado id_resultado, r12Authorize/ownerWeakMap reais. Payload contém todos os10campos CAS/material/chave originais e evidence.review integral; requisito/execução/documentVersion/hash/result vêm dessas projeções fechadas e coherentes. É simulação técnica local, nunca revisãoHML ou autorizaçãoR19. Não usar registroOct, terceiro mês, mês falso, UUID histórico trocado ou owner/capabilidade afrouxados. Negativos de replay chamam RPCs originais, não helper renomeado.

RED antes GREEN nos consumidores existentes:
1. FULLCHAIN aprovação→registroACK+3tabelas→VGposterior, positivos e negativos cada missing/pending/foreign/stale/ordem/contexto/ACK.
2. DocR18/candidato hostis em TODAS entradas antes efeitos, SHA8003 deNode, história original preservada.
3. Brokerreadonly mesmo com provaowner/authorizeRecovery legítima recusa TODOS negócios antes persist/GETprivado/POST; nativefence0businesscontinuations.
4. Consumo atual de registro existente via rotaSSR/apresentação/pacote/itens reais, missing/foreign/hash/item/owner/generation/source divergentes bloqueiam; sem discovery/command.
5. Writer30/SHA31/H27/baseline17+2/max5 e0novosrecibos, UUIDs/payloadsR18consumidos/replaysemânticoSept e Oct bloqueados.

Manter testes históricos de segurança e native18 (filaSDK isolada/job≠opinion, sourceOrdering/preflightDrain, sourceforms5, SYS04/V112/V123) e expandir assertions internas readonly, sem reduzir casos/aumentar skips/inflar contagens. SDK/UI reais compilados, negativos0/múltiplos/foreign/stale/pending/hostile. Lint/formato, quatroCIs finais/Zero/LOCK, probe110módulos1476785bytes/source0024/8FQ noHEAD exato, revisão independente0C/I e merge normal. Sem testar segredos reais antes request autorizado separado.

## Controller e execução posterior

Nonce futuro trilha-a-fixtures-20261110-r19; gastarR18. Ancestrais PLAN2b6ab4f542c66309fb16d12f9998136641591f25, merge desteGATE e reader815dce2a4015e2bb1b5ec23e70633537ab008e62, mais todos anteriores. Preservar metadata10GETs/master0/cache9/retry2x5s/deadline60s, privacy e schema. Novos códigos fechados somente RECOVERY_R18_LEDGER e RECOVERY_R18_BINDING; reutilizar RECOVERY_READ_ONLY. Sem novos ENV/campos/GETs privados.

ApósBUILD4CI/review/merge/CIpush/freshalias, somente requestJSON7 separado operationfixtures/AUTO_DISCOVER/pai mergeBUILD exato/nonceR19/canônica/CI2. Freeze antes merge até BOTHoriginaisattempt1terminais. R19 executa READONLY e não consome saldo5. Semrerun/dispatch/R18novo/deploy/PROD. Inspeção protegida do original após terminal deve comprovar0novosrecibos/ledger19/bindings completos/logouttrue antes novo passo.

Depois, PLAN/GATE separadoC8/64 habilita audit requestbound e threadscope, não remoção global de AUDIT_BINDING_PENDING. A184+24 e19inventariadas/18públicas/204PNG anteriores permanecem nas origens. Não certificar27/72/DoD/V1 por este GATE ou lookup. APIaprovada permanece intocada. Rollback apenas por PR rastreável, sem desfazer negócios ou apagar recibos.

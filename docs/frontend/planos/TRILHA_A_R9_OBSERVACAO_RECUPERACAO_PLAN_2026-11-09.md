# PLAN R9: recuperação autenticada e diagnóstico fechado da observação

Issue #317, prioridade 0. Novo ciclo específico após #470. Este PLAN não executa Auth, SQL ou mutações. Sequência obrigatória: CI e revisão deste PLAN, GATE separado, RED causal, BUILD, GREEN/Teste C, revisão independente, merge protegido e solicitação única separada. Autorização contínua do titular já registrada; não requer novo aceite repetido.

## Âncoras e evidência comprovada

Frontend main 9e6ab95f067c22c3b95fccd99bdf7444c6d9c461, árvore 78da516e7760c120a8708a63d314986317b956dd. Backend main 5eca44aebead3183e81b5c1af0d1dffa5fb8feb6. HML READY https://contaos-41-hml.vercel.app, deployment dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp, produto 437c788e32f0325dd15c9d2e7277c10129bcb462. Produto e harness diferentes são intencionais; não redeploy por alteração do harness nem atribuir C13 novo ao produto servido. Preservar #455/#462/#468, C13, tipos 8ea7750b75fd9d76b29c36ce7613392e3ab65e19, catálogo e 25 normativas. Revalidar HEADs/CI/HML antes de integração.

R8: harness dea3ab73c9b47de1126054380b002c37b060ff84, run original 42611391440/attempt1, artifact13670961904. Inspeção original42613222286/job129146627132 SUCCESS; ZIP SHA256698e58fe9184b194cc1866b4c119d4df45ba23ccc5704665469a99793cce2fa9,11 dados+SHA256SUMS verificados. Report3309ASCII/SHA256e913478993f895726f9e207c975533ee4a6fd3d9dac8dd0a319919fcf06c67cb; receipts2562ASCII/SHA25620af329dd9c441e4ede575fa6cb94a65c3d136ad777613170045c696328fad25. Checkpoint6739817028 verificado.

Duas novas operações sealed→confirmed: criar_documento_competencia_v115 e solicitar_analise_competencia. Total10 confirmadas, saldo14 do teto24. Documento outubro c7f56ac9-81d6-45a4-81f8-db1383006c41/requisito75938450-a972-410c-8612-da3ef7dc0e00/competência50c26274-a36f-48e0-b2fe-5a1caf5d6a49. Análise solicitada não comprova conclusão ou UUID de execução. RequestId não é chave de idempotência. Preservar setembro R5 apesar do id ausente no report parcial R8.

Falha real OBSERVATION_FAILED/subphase RUNTIME_FRESH/phase FINAL_READBACK, completed=false, logoutVerified=true, cleanupFailure=null. Testes inertes do observador real demonstram perda de diagnóstico: HTTP503 e rejeição de leitura viram o mesmo bit. Não demonstram causa real de R8, aborto, limite ou dependência backend #139.

## Recuperação sem replay

Validar documento R8 canônico10chaves/6973ASCII, blob022c8a7da23f5ce27b5333a1bed0cd2a0fcaf2f3/SHA256b22c0e464915cd58f8d9918a2c4751078dbf73578528e833afd92fa646502884. Reportblob220aaf2b926274557fb9735406eda776f3a9d3bd e receiptsblobe3358c939a33d66b9e4ea900c9b85c51add7bc44 conferidos byte a byte. Derivar orçamento10/14; não reescrever histórico R8prior8/maxNew16.

Reconciliar documento outubro e execução já solicitada somente via UI e leituras oficiais existentes. Contexto/mês/relacionamentos/IDs e arquivo aprovado exatos. Documento ausente ou divergente, duplicidade, análise not_analyzed/stale/contexto incorreto bloqueiam sem comando novo. Negar replay semântico das duas operações de outubro mesmo com novos UUIDs, além das oito anteriores. Não reconstruir ACK ou chave aleatória ausente.

## Diagnóstico mínimo

Artefato separado observation-diagnostic.json com exatamente seis próprias chaves de dados: schema,frontendSha,harnessSha,deploymentId,workflowRun,firstFailure. firstFailure null ou quatro chaves exatas: contractKind,stage,statusHTTP,requestFailure. Identidade vinculada ao run real. Sem extras/símbolos/accessors/Proxy, Error/message/stack, URL, corpo, headers, tokens ou PII. Converter imediatamente a primitivos aprovados e validar integralmente antes de emitir.

contractKind pertence exclusivamente aos18 TABLE e20 RPC já observados, prefixados TABLE:/RPC:, ou UNKNOWN quando classificação indisponível; nunca nome livre. Oito stages: REQUEST_BINDING,REQUEST_ARGS,HTTP_STATUS,BODY_READ,RESPONSE_PROJECTION,RESPONSE_CONTEXT,OBSERVATION_LIMIT,UNAVAILABLE. HTTP_STATUS tem inteiro100..599 fora2xx e requestFailure NONE; BODY_READ preserva2xx realmente observado e classifica requestFailure NONE/ABORTED/OTHER/UNAVAILABLE. Demais stages usam statusNONE; combinações literais serão fechadas no GATE antes de código. Falha ao obter status/classificação permanece UNAVAILABLE.

ABORTED apenas quando request.failure().errorText do objeto Playwright confiável é integralmente net::ERR_ABORTED; outra string→OTHER, null→NONE, consulta indisponível→UNAVAILABLE. Não guardar texto externo. Não adicionar listener requestfailed nem ampliar matcher/fence/GET. Primeira falha permanente, registrada antes do throw/cleanup; sobreviver a close/logout/falhas posteriores. Flush continua fatal OBSERVATION_FAILED. firstFailure:null não prova sucesso; arquivo sempre emitido. Preservar report15/diagnostics9/recovery10, prazos, polling já aprovado e zero novos retries/refetch/invalidação de cache.

## Escopo e provas de saída

Somente quatro arquivos existentes do produtor: scripts/hml/authenticated-visual-audit.mjs e seu .test.mjs; scripts/hml/prepare-visual-fixtures.mjs e seu .test.mjs. Workflow atual já recolhe diretório inteiro, sem alteração YAML/dependências/lock/produto/transporte.

Artefato passa a14 dados+SHA256SUMS=15 membros, históricos11: acrescentar receipts-r8.json,recovery-r8.json,observation-diagnostic.json aos11 dados atuais. Leitor técnico será adaptado somente após terminal R9, em PR separado sob o novo GATE, com escopo fechado inspect-fixture-artifact.mjs/test e próprio workflow apenas se necessário. Preservar download/digest oficial, limites, diretório seguro, schemas e emissão somente após validação integral. Nenhuma exportação pública de PNG/DOM privados.

REDs causais: broker real10/14+replay negado; consumidores reais de documento/análise sem comando em inconsistência; observador real HTTP503 versus corpo rejeitado, primeira falha imutável após close e writer real14dados/15membros. Negativos incluem schema/identidade adulterados, getters/Proxy/canários, contexto/projeção inválidos, late events e isolamento. GREEN inclui protocolos Node/Chromium,15nativos, lint/Prettier, Zero-Drift, LOCK-TYPES e Teste C no mesmo HEAD; revisão independente0Critical/Important antes de merge.

Depois: solicitação JSON7campos nonce trilha-a-fixtures-20261109-r9, R1–R8 gastos, AUDIT_BINDING_PENDING preservado. CI2/review canônico/mergeS(P,R), freeze até upstream e ambos subscribers originais attempt1 terminais. Sem cancel/rerun/dispatch ou repetição dos18 públicos/204PNG revisados sem regressão demonstrada.

Os184 originais,24 dependentes de fixture,208 privados e72 critérios permanecem separados e não certificados. HML somente; sem PROD, AuthAdmin/service_role/SQL/RLS/schema ou enfraquecimento de segurança. Atualizar checkpoint com evidência real e próxima tarefa; V1 permanece NO-GO até DoD integral.

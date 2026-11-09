# GATE R11: projeção contextual V116/V117 e recuperação R10

Issue #317, prioridade 0. PLAN482 integrado em c9b0118f9289c7d44d87ec4e4745e5d99ba531bd; PLAN blob9689e0fb327f1141000d0d66bae0321dff115550. Este GATE documental só libera BUILD após CI, revisão independente e merge protegido. Não autoriza Auth, SQL ou execução HML. Fonte normativa5eca44aebead3183e81b5c1af0d1dffa5fb8feb6; produto437c788e32f0325dd15c9d2e7277c10129bcb462/deployment dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp. Revalidar fontes vivas nas etapas dependentes. C13, source_proof históricos,25normativas/catalog100/97/types8ea permanecem intactos.

## Escopo fechado

Apenas quatro arquivos no futuro BUILD:
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs

Nenhum SRC, YAML, dependência/lock, SQL, Supabase, types, RLS, grant, endpoint, listener, transporte, fence, corpo/HTTP, retry, polling, timeout ou regra de negócio muda. Não alterar OBSERVED_KEYS/OBSERVED_TABLES/OBSERVED_RPCS globais, matcher/default, caminhos JSON dinâmicos fonte/fonte_detalhe/regra_validacao, contexto de revisão ou admissão do request. Projetar somente após o contrato e contexto existentes serem validados.

## Evidência e limite causal

R10original42638883189/attempt1/head a3a5df2b4e99705d214a509ba035f155c7ae8de9, artifact13683268867/15559B/ZIP SHA256b306e1a4b89e839da5244e2b0ddc589f502618a2253dbcbb61415f68cc448a43. Inspeção42641761717/job129244407050:16/16hashes conferidos; report3251/SHA858c21b7eb05e379f6c92dd84cc5f7afe0d75406ab105d3b279b2f0d53703ef2; receipts55/SHAfc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf; observation430/SHA0b11018aae5529f19ccb6476bf8b1202f3a7e9ba8fab8811252a48b2904ddecf.
Observação RPC:obter_analise_competencia_v116/RESPONSE_PROJECTION/NONE/NONE. Falha global OBSERVATION_FAILED, ledger10/prior10/new0/max14, flagsfalse, logouttrue/cleanupnull. Nenhum rawRPC foi exportado. O descompasso estático é demonstrável; não afirmar qual campo bruto causou R10, nem importar BODY_READ/ABORTED de R9 ou causa R8.

Fontes congeladas: SDKV1167cce3daddb58240b20101eea087bd4b1cbbcf0e2; SDKV117ab3260bf9af63a23a904cdece2ae02f27d0a3efa; revisão2a7166a7d832424cb276df3a639b5e5dcc40fa5a; SQLV1167113db6d6009020e96883f685c239a5abdf9b797; SQLdetalhe8a90df3451355c1ebf78306522fafd6c6b7e1ac3; revisãoSQLb1c450b5d55fe481a13c1d22689f805e85a80a78. Caminhos completos e blobs constam do PLAN. Usar shapes completos derivados dessas fontes e parsers reais, sem consultas de negócio.

## Projeção permitida

Para obter_analise_competencia_v116 exclusivamente:
1. Omitir execucao_atual.metadados, execucoes[*].metadados e resultados[*].metadados ANTES de acessar seus valores ou recursar. Não inspecionar/registrar/reter conteúdo, getter, Proxy ou protótipo desses valores. Obter descritores próprios do envelope permitido não autoriza chamar accessor. Estrutura/envelope e siblings continuam validados. Nenhuma exceção para metadados em outro caminho/RPC; proibição genérica continua.
2. Preservar mecanismos somente no root. Caso SQL/SDK legítimo execucao_atual=null e mecanismos={} permanece {}, sem inventar zeros; o SDK o converte em null. Havendo execução ou contagens não vazias, exigir exatamente deterministico,semantico,humano,nao_identificado, números finitos não negativos inteiros, sem campos extras/coerção. Contagens derivam do SQL, não do conteúdo de metadados.
3. Preservar apontamentos[*].acao_sugerida como string limitada/null conforme limites existentes e parser SDK, sem permitir nome globalmente ou converter conteúdo desconhecido em aprovação.

Para obter_detalhe_requisito_v117, preservar apenas apontamentos[*].acao_sugerida tipada no caminho real. Não admitir metadados nesse RPC. requisito.condicao_aplicabilidade permanece OMITIDO conforme comportamento atual neste BUILD; não generalizar JSON nem incorporar a regra sintética sem prova/binding/GATE específico. Contexto de revisão existente segue inalterado.

Campos SQL conhecidos não usados pelo consumidor, como hash_contexto_atual/contexto_atual/requisitos_afetados/iniciada_por/id_resultado_referencia, seguem omitidos nos caminhos já conhecidos; presença normal não deve causar rejeição. Não ampliar essa omissão a vizinhos desconhecidos. Preservar todos os limites, paginação, tipos, enums, IDs e contexto organização/contrato/competência/requisito do observador. PII, URLs, mensagens livres e autor/revisorUID não ganham permissão.

## Recuperação R10 obrigatória e não replay

Documento contaos.fixture.recovery-r10.v1, blobc25bf837f91ce54238b829111d24c1415f503449,4768ASCII/canonicalpretty2+LF/SHA2565c1490e7d2e810bc4711ad2f8f6a7b11dd36e313b96940c196ecda6b0dd17ece.
Doze campos próprios ordenados: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw. Fixar workflowRun42638883189/artifactId13683268867/requestIdtrilha-a-fixtures-20261109-r10/harnessSha a3a5df2b4e99705d214a509ba035f155c7ae8de9 e ZIP/três hashes acima. Validar identidade, tipos, ordem/canonicalização/SHA dos raws,zero novas intenções/logouttrue,sem getter/símbolo/accessor/Proxy/protótipo hostil. Mandatory antes login/armamento e em todo broker/runtime recovery; nenhum fallback opcional.

Histórico dez confirmadas, maxNew14/teto24. R1–R10 gastos; nonce futuro trilha-a-fixtures-20261109-r11. Recibos não provam ACKexecUUID nem chave idempotência. Manter negação semântica do documentoOct c7f56ac9-81d6-45a4-81f8-db1383006c41 e análise já solicitada, inclusive com novos UUIDs/requestIds; negações R1–R8 anteriores intactas. Reutilizar competênciasOct50c26274-a36f-48e0-b2fe-5a1caf5d6a49/Sep79bdc139-ed10-4c91-905e-b32b9a824d27/requisitoOct75938450-a972-410c-8612-da3ef7dc0e00/fonte/lista/arquivo aprovados via UI/GETs existentes. Não repetir operação nem inferir ausência/execução pelo report parcial. Novembro histórico intacto.

## RED obrigatório e prova GREEN

Publicar teste RED antes de produção e conferir falha causal, não import/sintaxe. Exigir:
- shapes SQL completos V116 com três metadados não vazios e canários/getters/Proxy/revoked nested, zero acesso/traps/conteúdo; observador real, envelope/contexto e parser SDK reais. O parser/consumer deve usar projeção admitida, não DTO já higienizado que contorne o observador;
- mecanismos{} semexecução e quatro contagens comexecução; extras/tipos/coerções/NaN/Infinity/negativo/fracionário rejeitados, limites mantidos; acao_sugeridaV116/V117 no caminho real;
- metadados em foreignpath/RPC, vizinhos desconhecidos/PII/limites/contexto/paginação/IDs divergentes continuam fatais. KnownSQLnonUIomitnormal não equivale a ignorar qualquer extra;
- recuperaçãoR10 ausente/crossproof/hash/raw/getter/Proxy inválidos bloqueia anteslogin/arm, budget10/14 exato e replays semânticosOct comUUIDnovo negados;
- CAU2, firstFailure sticky6top/4first/8stages e report fatal consistency permanecem. Corpo/HTTP/abort continuam fatais, sem retry/refetch/cacheinvalidations/GET novo.

Preservar16nativas atuais, basepassed8, títulos/TAP3 sourceforms, sourceOrdering/preflightDrain e fábrica pinada. Cobertura nova deve executar SDK/parser/consumer real derivado das fontes com observador real em fixture inerte: acrescentar quarto suplemento sourceforms com título EXATO "R3 Chromium sourceforms scoped V116 V117 projection and actual SDK parsers", mantendo os três títulos anteriores em ordem e exigindo TAP1..4/tests4/pass4/failcancelledskipped0. Retorno4 e total factual17=8+1+4+2+1+1; nativeProof.passed continua8. Sem inflar contagem por asserções/Node. Se implementação demonstrar necessidade de outra organização de caso, revisar este GATE antes de alterar contagem, nunca alegar execução antecipada.

GREENmesmoscasos/CIHEADliteral: Node/protocolos/Chromium17, helper30, produto/TS/build/lint/Prettier/Zero/LOCK/TesteC aplicáveis; revisão independente e merge protegido. Não reutilizar atestado de HEAD antigo ou chamar teste sintético de HML.

## Artefato e etapas posteriores

Writer18dados+SHA256SUMS=19membros/HISTORY15: manter os16nomes atuais em ordem e append somente receipts-r10.json,recovery-r10.json, hashesoriginais acima. Report15/diagnostics9/recovery10/observation6/4 intocados, raws históricos imutáveis.

Após BUILDverde/revisado/integrado, request separado SOMENTEJSON7campos/fixtures/nonceR11/blankpairAUTO_DISCOVER/approved_parent_sha real. Doischecks/canônica commitbound/freshness e merge normal; congelar main/deployment até upstream+doissubscribers originais attempt1 terminais. Sem rerun/cancel/dispatch/Auth alternativo. AUDIT_BINDING_PENDING preservado.

Após R11terminal real, leitor em PR separado somente scripts/hml/inspect-fixture-artifact.mjs e .test.mjs, workflowinspeção apenas se estritamente necessário; pins reais/18dados/HISTORY15, políticas459/FD/digest/toolpin/30s/envmínimo/captura/Nodewarnings/CAU2 preservadas. CI/review/merge protegido antes do originalpushmain readonly. Nenhum leitor genérico/ZIPmanual.

Atualizar checkpoint com fatos. Preparar24fixtures não certifica184/208/232/72/V1. Preservar18públicos/Run124204PNG102DOM307/307hashes, C13 e aprovações anteriores sem repetição injustificada. NenhumPROD/AuthAdmin/service_role/SQL/RLS/schema/types/deps/lock ou relaxamento.

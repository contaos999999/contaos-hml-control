# PLAN R11: compatibilidade fechada das projeções V116/V117

Issue #317, prioridade 0. Corrigir a leitura consumida pelo preparador para concluir as 24 fixtures e avançar os 184 casos originais, preservando aprovações e controles. Este PLAN exige GATE separado, RED, BUILD, GREEN, revisão independente e merge protegido antes de qualquer nova solicitação HML. Não autoriza código, Auth ou SQL.

## Âncoras e resultado comprovado

Base frontend d1ffea12f5575629153c4dccce11b73fefd36d45. Produto HML437c788e32f0325dd15c9d2e7277c10129bcb462/deployment dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp; harness e produto diferentes são intencionais. Fonte normativa examinada5eca44aebead3183e81b5c1af0d1dffa5fb8feb6. Revalidar HEADs e alias antes de etapas dependentes. Preservar C13, snapshot/source_proof históricos,25normativas/catalog100/97/types8ea7750b75fd9d76b29c36ce7613392e3ab65e19.

R10originalrun42638883189/attempt1/head a3a5df2b4e99705d214a509ba035f155c7ae8de9 terminou FAILURE; artifact13683268867/ZIP SHA256b306e1a4b89e839da5244e2b0ddc589f502618a2253dbcbb61415f68cc448a43. Leitor481 integrado emd1ffea12, inspeção original42641761717/job129244407050SUCCESS, unit129244407190SUCCESS; Zero42641761881 eLOCK42641761738SUCCESS. Conferência independente validou16/16 hashes e bytes.

Raws originais: report3251bytes/SHA256858c21b7eb05e379f6c92dd84cc5f7afe0d75406ab105d3b279b2f0d53703ef2; receipts55bytes/SHA256fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf; observation430bytes/SHA2560b11018aae5529f19ccb6476bf8b1202f3a7e9ba8fab8811252a48b2904ddecf.

R10firstFailure: RPC:obter_analise_competencia_v116/RESPONSE_PROJECTION/NONE/NONE. Report global FINAL_READBACK, primary OBSERVATION_FAILED/RUNTIME_FRESH, ledger count10/prior10/newArmed0/maxNew14, frozen/pending/sent false, receipts[], logouttrue/cleanupnull, recoveryreconciledtrue e bindings parciais. Isso não demonstra qual campo bruto causou a falha. O raw RPC não foi exportado. Não atribuir ao R10 o BODY_READ200/ABORTED do R9 nem atribuir a causa R10 ao R8.

O push do leitor gerou Fixtures42642047399 com preflight bloqueado/private129245964807SKIPPED e Audit42642047403/private129245670976SKIPPED. São eventos distintos do R10 original e não constituem novo Auth. Checkpoints oficiais6743488621 e6743585765 foram escritos e conferidos pelo Root.

## Forense estática e limites da conclusão

No produto437, fontes conferidas:
- src/lib/competencias/competenciaAnaliseDados.ts, blob7cce3daddb58240b20101eea087bd4b1cbbcf0e2; UI src/components/competencias/CompetenciaAnalise.tsx, blob454789ef8e3c23ffee5b5c7b48991a15eaf0e218.
- src/lib/competencias/requisitoDetalheDados.ts, blobab3260bf9af63a23a904cdece2ae02f27d0a3efa.
- src/lib/competencias/revisaoRequisitoDados.ts, blob2a7166a7d832424cb276df3a639b5e5dcc40fa5a.

No repositório contaos999999/develop em5eca, SQL examinado como fonte, sem executar:
- supabase/migrations/20261108114652_p0_null_pagination_guard.sql, blob7113db6d6009020e96883f685c239a5abdf9b797, V116linhas227/272/289/302.
- supabase/migrations/20261103172929_v117_obter_detalhe_requisito.sql, blob8a90df3451355c1ebf78306522fafd6c6b7e1ac3.
- supabase/migrations/20261107094443_p0_v117_revisao_humana.sql, blobb1c450b5d55fe481a13c1d22689f805e85a80a78, linhas76–79.

V116SQL inclui metadados em execucao_atual, execucoes e resultados. A projeção atual do produtor63dbb8e07d56b2130898138e7a35ded66b1f970e rejeita metadados não vazios mesmo no caminho strict:false. Reprodução inerte demonstra a incompatibilidade; não identifica o campo causal único do retorno R10.

OBSERVED_KEYS já contém mecanismos. O filtro RPC_ROOT_FIELDS de V116 omite esse root e a recursão atual não admite seus quatro filhos. Apenas admitir o root continuaria produzindo objeto vazio. O SDK precisa das contagens deterministico/semantico/humano/nao_identificado conforme seu contrato. apontamentos[*].acao_sugerida também não é preservado.

V117detalhe não exporta metadados em seu SQL. Não criar exceção de metadados nesse RPC. O SDK usa apontamentos[*].acao_sugerida e requisito.condicao_aplicabilidade. Este último passa por textoJson e aceita JSON dinâmico no produto; isso não autoriza ampliar o observador. O contexto de revisão existente está alinhado e não requer mudança.

## Correção mínima proposta

Somente quatro caminhos futuros:
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs

Criar tratamento de projeção vinculado ao RPC e ao caminho exato do DTO, depois da admissão existente do request. Não editar OBSERVED_KEYS global, OBSERVED_TABLES, OBSERVED_RPCS ou o contrato genérico de proibição de metadados.

Para obter_analise_competencia_v116, omitir exclusivamente execucao_atual.metadados, execucoes[*].metadados e resultados[*].metadados antes de acessar seus valores ou percorrer seu conteúdo. Não reter, registrar ou inspecionar seus valores, getters, protótipos ou conteúdo interno. Metadados em qualquer outro caminho ou RPC continuam proibidos.

No mesmo DTO V116, preservar mecanismos somente no root com as quatro contagens tipadas comprovadas pelo SQL/SDK, e apontamentos[*].acao_sugerida somente no caminho usado pelo SDK. Não criar dicionário livre ou permitir esses nomes globalmente. Preservar limites, contexto, paginação, IDs, versões e demais tipos admitidos.

Para obter_detalhe_requisito_v117, preservar apontamentos[*].acao_sugerida no caminho tipado. requisito.condicao_aplicabilidade só pode receber suporte com contexto e shape exatos da fixture comprovados, ou null conforme o SQL. A regra sintética conhecida é {documento:{obrigatorio:true,tipos:['outro']},condicao:{tipo:'sempre'}}; fechar somente a estrutura efetivamente demonstrada no snapshot/campo, sem generalizar JSON. Se essa prova não for suficiente, manter a omissão atual do campo opcional e declarar eventual binding/GATE futuro. Isso não bloqueia a correção V116.

Manter o comportamento existente para JSONs dinâmicos fonte, fonte_detalhe e regra_validacao. Não ampliar dicionários nem expor autor/revisorUID, PII, URLs, mensagens ou metadados. Campos não usados no consumidor, como hash_contexto_atual/contexto_atual/requisitos_afetados/iniciada_por/id_resultado_referencia, seguem omitidos conforme sua proveniência.

Não alterar SRC, SQL, Supabase, rotas, transporte, listeners, fences, política de corpo/HTTP, polling, timeouts, retries ou regra de negócio. Falhas permanecem fatais; CAU2, firstFailure imutável, diagnóstico6/4 e consistência fatal report/observação permanecem. Não reduzir observabilidade nem converter desconhecido em sucesso.

## Recuperação R10 obrigatória

Documento proposto contaos.fixture.recovery-r10.v1, blobc25bf837f91ce54238b829111d24c1415f503449,4768ASCII/canonicalpretty2+LF/SHA2565c1490e7d2e810bc4711ad2f8f6a7b11dd36e313b96940c196ecda6b0dd17ece. Doze chaves na ordem: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw.

Fixar no GATE os valores originais: workflowRun42638883189/artifactId13683268867/requestIdtrilha-a-fixtures-20261109-r10/harnessS a3a5df2b4e99705d214a509ba035f155c7ae8de9/ZIPb306e1a4b89e839da5244e2b0ddc589f502618a2253dbcbb61415f68cc448a43 e os três raws/hashes acima. Validar shape, tipos, origem, canonicalização, SHA, zero novas intenções R10 e logout verificado antes de login/liberação de armamento e em todo broker/runtime recovery, sem fallback. Conservar NodeisProxy/own descriptors/zero getters/protótipos/símbolos como nos documentos anteriores.

Manter dez confirmações históricas, maxNew14/teto24, negações e requests históricos. Não repetir o documento de outubro c7f56ac9-81d6-45a4-81f8-db1383006c41 nem a análise já solicitada, mesmo com novos UUIDs/requestIds. Reutilizar competências Oct50c26274-a36f-48e0-b2fe-5a1caf5d6a49/Sep79bdc139-ed10-4c91-905e-b32b9a824d27, requisitoOct75938450-a972-410c-8612-da3ef7dc0e00, fonte/lista/arquivo aprovados. Ler estados e UUIDs reais pela UI/leituras oficiais existentes; não inferir execução ou idempotência a partir dos recibos. Manter novembro histórico.

## RED, GREEN e execução posterior

1. Após PLAN integrado, publicar GATE separado com o escopo mínimo e fixtures fechadas. O PLAN não autoriza BUILD/Auth.
2. RED causal com shapes derivados do SQL completo e parsers SDK reais: observador real/contexto/firstFailure; três metadados V116 com canários/getters/Proxy sem leitura; mecanismos quatro contagens e acao_sugerida; V117 nos paths autorizados. Demonstrar preservação da proibição em foreignpaths, campos extras/PII, contexto divergente e limites. Não usar import/sintaxe quebrados como RED nem alegar reprodução do campo bruto histórico R10.
3. GREEN nos mesmos consumidores e revisão independente no HEAD final. Preservar as16execuções nativas atuais, basepassed8 e identidades/guardas; acrescentar cobertura real derivada sem inflar contagem por asserções. Node/protocolos/Chromium, helper30, produto/TS/build/lint/Prettier/Zero/LOCK/TesteC aplicáveis; registrar os totais atuais, não reutilizar contagens antigas.
4. Depois de BUILD verde/revisado/integrado, PR distinto somente JSONsete campos, operationfixtures/nonce trilha-a-fixtures-20261109-r11/AUTO_DISCOVER e approved_parent_sha do main aprovado real. R1–R10 gastos; AUDIT_BINDING_PENDING preservado. Dois checks/canônica commit-pinned/lease de fontes/HML e merge normal. Congelar main/deployment até upstream e dois subscribers originais attempt1 terminais. Semrerun/cancel/dispatch/novoAuth alternativo.
5. Artefato futuro18dados+SHA256SUMS=19membros/HISTORY15: preservar a ordem dos16dados atuais e append somente receipts-r10.json e recovery-r10.json. Report15/diagnostics9/recovery10 e observation6/4 mantidos; históricos intocados, hashes iguais legítimos permitidos.
6. Após terminalR11 real, PR separado do leitor sob o futuro GATE, nos dois mjs existentes e workflow somente se necessidade estrita: pins reais,18dados/HISTORY15 e diagnóstico completo, mesmas políticas readonly/downloader/digest/captura/Nodewarnings/FD/bounds/CAU2. CI/review/merge protegido precedem inspeção originalpushmain. Nenhum leitor genérico/controlador ou ZIP manual.

Atualizar checkpoint oficial com provas reais. Bindings finais e auditoria dependem de GATE próprio. Preparar24fixtures não encerra184casos nem certifica208/232/72/V1. Preservar18públicos aprovados, Run124204PNG/102DOM/306hashes, C13 e aprovações anteriores sem repetição injustificada. HMLsomente; nenhumPROD/AuthAdmin/service_role/SQL/RLS/schema/types/deps/lock ou relaxamento de segurança.

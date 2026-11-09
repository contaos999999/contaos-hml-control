# PLAN R10: concluir leituras antes de navegar ou trocar o mês

Issue #317, prioridade 0. Novo ciclo específico após diagnóstico real da R9. Não repete PLAN322/GATE323/BUILD324 ou as 18 provas públicas. Este documento não executa Auth, SQL ou mutações. CI e revisão do PLAN, GATE separado e integrado, RED causal, BUILD, GREEN/Teste C, revisão independente e merge protegido antecedem nova solicitação única.

## Âncoras e fatos

Base main0144f12829fcd9bdd5557950f095a3479ffafe14; backend5eca44aebead3183e81b5c1af0d1dffa5fb8feb6. Produto HML437c788e32f0325dd15c9d2e7277c10129bcb462/deploymentdpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp, diferente do harness intencionalmente. Revalidar HEADs/CI/HML antes de integração. Preservar C13, source_proof histórico, snapshot5eca, catálogo100/97,25normativas/tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19 e barreiras455/462/468/473. Sem redeploy por mudança do harness.

R9 original: S2ed3097691f39025b49a015d86223da61a2b45e5, upstream42621756761SUCCESS, Fixtures42621964900/attempt1FAIL, Audit42621964902SUCCESS/privateSKIP. Artefato13676832673,13476bytes, ZIP SHA25689a35fb6de1e437a93c8074cb563745108d5e968878d929c8663dcaff700f500. Leitor475 integrado em0144, inspeção original42625143276/job129186862567SUCCESS. Root e revisão independente verificaram14/14 hashes/bytes, incluindo11 históricos.

Fato observado: TABLE:competencias / BODY_READ / HTTP200 / ABORTED. O literal resulta exclusivamente de request.failure().errorText integral net::ERR_ABORTED. Report: phaseSOURCE_AND_LIST, subphaseRUNTIME_FRESH, pathSOURCE_AND_LIST→RECOVERY_READ→RECOVERY_READ→RUNTIME_FRESH→RUNTIME_FRESH; primaryOBSERVATION_FAILED. Ledger count10/prior10/newArmed0/maxNew14, frozen/pending/sentfalse; receipts vazios; logoutAttempted/Verifiedtrue, cleanupFailure=null; completedfalse/reconciledfalse/bindingsnull. Dez confirmações preservadas, saldo14/teto24. Não atribuir retroativamente essa causa ao R8. Backend139 não demonstrado como dependência.

Source forense: goKnown verifica deployment e navega antes de fresh/observer.flush; link já chama fresh antes da navegação. reconcileRecoveryCompetencies usa goKnown na rota da lista para cada mês e depois altera o filtro. A lista real437 usa React Query, chave com filtros.mes e SDK que consome AbortSignal. Mudança de chave/unmount pode cancelar a consulta. A observação não contém query ou ação causadora; o gatilho específico R9 permanece não identificado. Outra falha determinística de freshness foi reproduzida em JavaScript com matchesObservation/pathValue reais: o ordinal é capturado antes de goKnown, e um GET inicial sem predicado de mês, contendo a linha October, satisfaz where(month) por conteúdo da linha. Isso permite avançar sem provar a conclusão do GET filtrado. O SDK437 usa eq(competencia_referencia, YYYY-MM-01), select de nove campos, ordenação referencia.desc/id.desc e offset0/limit25; a gramática atual já admite esse filtro. O experimento abaixo deve provar o mecanismo e a correção, sem confundir hipótese com evidência HML.

## Correção pretendida

Adicionar barreira local de leitura antes de navegação e mudança de mês, esperando as requisições oficiais já iniciadas até a leitura e validação do corpo. Não depender apenas de networkidle. Preferir as barreiras existentes observedAfter/read: concluir explicitamente o GET inicial da lista, capturar NOVO ordinal depois dessa conclusão e imediatamente antes de preencher o mês, e só prosseguir após o GET mensal posterior a esse ordinal. Acrescentar flush local antes de goKnown/goto. Rastrear somente contratos de GET e RPC de leitura já admitidos; eventual rastreamento adicional de requisição sem resposta exige RED específico e limite fechado no GATE. Não ampliar URLs, endpoints, argumentos, DTOs ou contextos. Preservar validação integral, primeira falha imutável, limpeza e fatalidade do observador.

A barreira não executa nova rede, retry, refetch, reload adicional ou invalidação de cache. Preservar navegações existentes quando necessárias à causalFloor e à prova fresca; evitar reload só se o mesmo contrato causal puder ser comprovado, sem promover cache a leitura. Ausência de resposta, timeout, contexto inválido ou cancelamento continuam fatais. Não ignorar ABORTED, não excluir respostas pendentes da validação e não mudar política de fence, transportes ou SDK. Não emitir query/URL/corpo/credenciais no diagnóstico.

Limite global por barreira local de até15s, compartilhado entre leituras, sem multiplicar por requisição; GATE fechará a implementação e o relógio de teste antes do código. Seal3s e schema observation6/first4/matriz8 permanecem. Timeout local usa falha fechada existente/UNAVAILABLE, sem incluir erro externo. Nenhuma espera ilimitada, listener irrestrito ou método público que autorize continuar após falha.

## RED e teste nativo

Usar CI como executor do navegador inerte; o executor local está indisponível e não iniciar VM paga. Não alegar reprodução Chromium antes de executá-la.

RED deve usar consumidor real, observer real e Chromium, com React Query/SDK do frontend437 ou extração controlada já empregada pelos testes nativos. Reproduzir resposta200 com corpo ainda pendente e mudança de filtro/navegação que cancela a leitura; demonstrar erro no fluxo atual. GREEN deve aguardar a conclusão validada antes da ação seguinte e não armar comando de negócio. O teste demonstra mecanismo compatível, sem identificar por inferência o GET histórico específico.

Preservar os15 casos nativos anteriores e acrescentar o terceiro preparerSourceFormsCase de recuperação de competências no comando nativo existente, total16. React Query congelado5.101.4, componentes e SDK reais ou extração controlada, servidor HTTP loopback inerte com headers/corpo controlados, factory nativa existente e zero writes. Demonstrar separadamente o cancelamento React Query e a ordenação do consumidor, sem chamar uma fixture de reprodução unívoca do gatilho HML. Sem novo workflow/dispatch/CLI genérico, page.route ou fallback de transporte. GATE fixa contagem e campos exatos antes do BUILD; attestation futura continua estrita. Negativos: resposta sem headers/corpo pendente, timeout limitado, aborto real fatal, contexto divergente durante drain, falha anterior preservada, novo evento tardio e nenhuma ação antes da barreira. Conferir filtroeq/range real do SDK sem alterar gramática do observador por suposição.

## Recuperação e escopo

Documento R9 obrigatório antes do login em todo caminho recovery, sem fallback: blobce22f033a617f89192aa397fd9cd1cdab8512eb4,12campos/3170ASCII, SHA25671e20cc2dfd5888ab22228efe2b253eea316194ce0503e262ad58aef516078b8. Ordem: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw. Schema contaos.fixture.recovery-r9.v1. Preservar bytes e valores históricos, incluindo R8prior8/max16 e R9prior10/max14.

Report1813B SHA4163c5266ed9715ceafa3650af55a42348636cfbccceb9c8f124b55ab1eac31e; receipts55B SHAfc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf; observation404B SHA6beb2ab824c183a65b1bd7334a4a6ab7ca878a0c6cab999a32dfd39a4ec5cad6. Documento prova zero novas intenções R9, não zero Auth. Budget continua10+14/teto24 e negação semântica das dez operações, inclusive documento/análise Oct com novos UUIDs.

BUILD limitado aos quatro mjs existentes: authenticated-visual-audit, prepare-visual-fixtures e respectivos testes. Sem produto, workflow, dependências, lock, SQL ou nova permissão. Atualização documental canônica só no GATE/PLANO_ATIVO/ESTADO; reancoragem adicional apenas se HEAD realmente mudar e comparação provar escopo.

Artefato futuro16dados+SHA256SUMS=17membros/HISTORY13, acrescentando somente receipts-r9.json e recovery-r9.json; observation atual permanece no mesmo nome. Report15/diagnostics9/recovery10 e diagnóstico6/4 preservados. Reader pós-terminal R10 em PR separado sob este futuro GATE: somente seus2mjs, próprio workflow apenas se estritamente necessário e explicitado no GATE. Nenhum PNG/DOM privado em logs públicos.

## Saída e continuidade

Após RED causal, GREEN no mesmo HEAD: protocolos Node/Chromium, contagem nativa estrita, lint/Prettier, Zero/LOCK, Teste C, revisão independente0Critical/Important e merge normal. Depois JSON7campos nonce trilha-a-fixtures-20261109-r10, R1–R9 gastos, AUDIT_BINDING_PENDING preservado; review canônico/CI2/mergeS(P,R) e freeze até upstream e ambos subscribers originais attempt1terminais. Sem rerun/cancel/dispatch.

Preservar18públicas/204PNG revisadas em suas origens. Os184 originais,24dependentes de fixture,208privados e72critérios continuam separados. Não certificar V1 por CI/recibos. Atualizar checkpoint com prova e próxima tarefa. HML somente; sem PROD/AuthAdmin/service_role/SQL/RLS/schema ou enfraquecimento de segurança.

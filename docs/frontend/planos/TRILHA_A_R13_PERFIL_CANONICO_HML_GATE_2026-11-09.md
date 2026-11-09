# GATE R13: perfil canônico GITmain HML e prova de zeroAuth R12

Issue #317, prioridade0. PLAN494 integrado7b2dd9161016981f8da7401ceba94305a691c19b, PLANblobf9bdccc70dad96f058fde1d3d415578fd5f43da4. Este GATE somente libera a operação HML e o BUILD abaixo depois de CI/revisão independente/merge protegido. Não libera Auth, SQL, request, rerun de negócio ou projetoPROD. C13/491/492/source_proof/types8ea/catalog100/97/25normativas e históricos permanecem intactos.

## Operação única no mesmo projeto HML

Depois do merge deste GATE, Root fixa como Dsha o SHA real do main aprovado que integra este GATE, com checks aplicáveis SUCCESS e readback de Git/parents/árvore. Antes da chamada, main deve continuar exatamente nesse SHA. Criar UMA nova build pelo create-deployment oficial no projeto prj_JtEWXg54EIYcQPwVzFiQyJcVIlFo/namecontaos-41-hml/time team_yeAabFPw9FQ4nS68g7LASDEJ, repositórioGitHub1442722734/contaos999999/contaos-hml-control. gitSource.type=github,repoId=1442722734,ref=main; target=production é o rótulo técnico deste projeto HML. Query forceNew=1 permite build fresca/bypass de deduplicação, não prova bypass de ignore-build.

Não herdar/redeploy CMf: deploymentId ewithLatestCommit omitidos. projectSettings/customEnv/skipAutoDetectionConfirmation e overrides de ignoreCommand/buildsettings omitidos; configurações podem persistir, portanto não tratá-las como descartáveis por build. Sem Turbo/env/secrets/billing/segurança/meta/gitMetadata spoof/sourceupload avulso/refSHA/projeto alternativo. Se CANCELED/ERROR, guardar API/logs permitidos e investigar antes de nova proposta; não retry cego, não inferir motivo pelo buildEvents vazio.

Root verifica API atual projectId/team/repo/gitSHA=Dsha/branchmain/targetproduction/READY e domínio/aliases. Se main mudar durante a operação ou SHA divergir, bloquear. Somente aliases HML deste mesmo projeto, incluindo contaos-41-hml.vercel.app e o aliasgit-main já previsto, podem ser atribuídos ao D real validado quando necessário para binding. Nenhum alias/projetoPROD ou outro recurso. Registrar D/deploymentId reais após API, sem inventar pins futuros.

Manter a política fixed11 e client config byte-idênticas: branchURLcontaos-41-hml-git-main-contaos9999.vercel.app; ENV/TARGET_ENVproduction; refmain/providergithub/PR_IDvazio; repoID1442722734/ownercontaos999999/slugcontaos-hml-control; projectId acima/productionURLcontaos-41-hml.vercel.app. Preservar clientSupabaseHMLgklhhhyosgasnyoxlrui e demais CLIENT_PUBLIC_CONFIG existentes. Os conteúdos SRC348649f6/C13 permanecem; D terá sua própria identidadeGitmain, nunca um frontendSHA348 atribuído a outro build.

Depois de BUILD/merges e imediatamente antes de request, Root revalida aliasD/READY/Dsha/ancestralidade/backend/main e ausência de deployment concorrente que possa trocar o binding. Reatribuição HML, se necessária, só ao mesmo D validado e sem nova build. Se o binding ou perfil mudar, não gastar nonce: bloquear até nova evidência. Após request, main/deployment congelados até todos os originais terminais.

## Probe público obrigatório em CI antes de consumir R13

Dsha/deploymentId precisam existir e estar comprovados pela operação antes do BUILD final. Nos dois mjs permitidos, acrescentar teste Node de integração que chama discoverPublicGraph() REAL, sem fetcher fake, e resolveDeploymentIdentity(graph.modules,{frontendSha:Dsha,deploymentId:D}) com esses dois pins literais reais. Nenhum process.env/skip/fallback/placeholder pode fazer esse teste PASS sem executar a descoberta pública. Exigir igualdade e os validadores existentes fixed11/client/identidade intactos.

Usar as funções já exportadas e boundedPublicFetch existentes: somente GET HML/login e assetsJS no destino permitido, credentials:omit,redirect:error,no-cache,status200/responseURLexata,HTML256KiB/JS4MiB/total8MiB/até128módulos/4paralelos. Deadlinegraph180000ms existente é checado entre batches; cada fetch tem15000ms. Não alegar um timeout global mais forte, aumentar/resetar limites ou criar transporte/CLI/env/YAMLnovo. Registrar cardinalidade/bytes reais, sem exigir110 históricos437. Logs somente marcador técnico fechado PASS/HEAD/Dsha/D/moduleCount/bytes, sem bundle/rawURLs/headers/env/keys. Probe não executa app, Auth, Supabase, screenshots ou os18casos públicos; não equivale à proveniência/SSR/sessãoMaster.

CIAuth/Fixtures do HEADfinal precisa executar esse probe e passar antes de requestR13, além de18nativas reais e validações usuais. Step7 strict/proveniência/TLS/SSR/ancestralidade/nativas antessecret continuam protegendo mudanças posteriores do alias; a descoberta de identidade é candidata, não substitui essas barreiras.

## R12 original e prova técnica fechada

R12headS3d6bea3e938459f348130bf1d04431a072dba081, todos attempt1/main:
- upstream42666600147/workflow406076025/push/ContaOS Frontend Zero-Drift SUCCESS: jobs129331797954 Zero-DriftSUCCESS e129331798384 TesteC independenteSUCCESS.
- Fixtures42666864017/workflow411426169/workflow_run FAILURE: jobs129332744911 solicitaçãoSUCCESS,129332747763 protocoloSKIPPED,129333370334 preparaçãoHMLFAILURE.
- Audit42666864220/workflow411115674/workflow_run SUCCESS: jobs129332746954 solicitaçãoSUCCESS,129332749745 protocoloSKIPPED,129332966127 auditoriaHMLSKIPPED.

Exigir os paths/names/repos públicos/ownerIDs/workflowIDs/HEAD/head_repository/main/attempt/status/conclusão exatos; totaljobs2/3/3 e nenhum extra/ambíguo. Conferir run e endpoint attempt1 por seus campos, sem exigir igualdade integral de timestamps entre os dois objetos. Campos de tempo devem ser válidos/coerentes individualmente. Conferir a matriz completa do private129333370334, nomes/números fixados pelo workflow original:
- 1Set up job,2Checkout imutavel do executor main,3Run actions/setup-node@v4,4Run node --test scripts/ci/install-pinned-bun.test.mjs,5Dependencias congeladas do executor,6Recibo inicial publico para as fases sem credenciais: SUCCESS.
- 7Reancorar deployment HML sem credenciais, antes do checkout da fonte: FAILURE.
- 8Validar SHA ancestral antes de baixar ou executar a fonte;9Fonte aprovada em checkout separado, sem credenciais persistidas;10Dependencias congeladas da fonte aprovada;11Run actions/cache@v4;12Run ./node_modules/.bin/playwright install --with-deps chromium;13Barreira nativa no mesmo HEAD antes de secrets;14Preparacao e SSR sem credenciais privadas;15Revalidar main e unicidade dentro da concorrencia antes de secrets;16Somente agora fornecer o par sintetico ao preparador separado: SKIPPED.
- 17Verificar hashes gerados, inclusive em resultado parcial;18Evidencia privada imutavel por 90 dias: FAILURE.
- 35Post Run actions/setup-node@v4 SKIPPED;36Post Checkout imutavel do executor main SUCCESS;37Complete job SUCCESS.
Todos completed, sem steps extras/ausentes.

Artifacts do runFixtures deve ter total_count0 e array vazio. Step16SKIP prova que o único fornecimento do par Master não executou; não inferir logout/recibos/bindings ou estado de negócio. Prova zeroAuth/zero novas intenções é derivada da matriz original e código pinado, não um report de execução. Não exportar erro bruto, payload, URL, token ou env.

Origem Git obrigatória em S: fixturesYAML9af69f3ae0797cd4f0e9713950e473bc1b4a8f17; auditYAML848acf35a51bb5b420d5cf9047972da4a75a98eb; auditor12549d9cf6058ebb098832d71ca5b9ad9a0c2e0d; preparerc4979dc74ecd033c2a38d479115e7d1302060d37. Caminhos respectivos .github/workflows/contaos-trilha-a-fixtures.yml,.github/workflows/contaos-trilha-a-authenticated.yml,scripts/hml/authenticated-visual-audit.mjs,scripts/hml/prepare-visual-fixtures.mjs. Ler os quatro objetos, recomputar Gitblob SHA pelo conteúdo e comparar com os pins; provar S ancestral do pai aprovado R13. Não trocar Git real por texto mock no runtime.

verifyR12ZeroAuth usa o transporte singleRequestGet existente e dez GETs fixos: run/attempt1/attempt1jobs de cada um dos três runs, mais artifactsFixtures. Listas fechadas2/3/3/0, sem paginação incompleta ou endpoint arbitrário. Preservar deadline60000ms da sessão/perGETmáximo5000ms/bytes4194304/redirecterror/status200/tokenENVrevalidado por chamada/semretry. Limites globais de paginação10×100 existentes continuam intactos. Falta, indisponibilidade, erro ou ambiguidade bloqueiam.

## Cache existente e BUILD mínimo2mjs

Somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Não editar preparer/teste/YAML/deps/lock/SRC/types/backend/transporte/fence/políticasfixed11.

Noncefixtures futuro trilha-a-fixtures-20261109-r13; R12 acrescentado aos gastos. Acrescentar ancestralidade deste GATE integrado ao contratoGit. verifyR12ZeroAuth é chamado no controller verifySingleRequest existente depois da seleção da operaçãofixtures/R13, antes de emitirselected/autorização. O subscriber oposto continua saindo antes de API/private. Executar nas chamadas preflight e Step15, com tokenread-only isolado existente; não passar token a browser/build/Master.

Retorno técnico r12ZeroAuth no runtimecache SINGLE_REQUEST existente: nove campos próprios ORDENADOS schema,headSha,upstreamRun,fixturesRun,auditRun,privateJob,attempt,derivedNewBusinessIntents,proof. Valores fixos: schema "contaos.single-request.r12-zero-auth.v1",headShaS acima,upstreamRun42666600147,fixturesRun42666864017,auditRun42666864220,privateJob129333370334,attempt1,derivedNewBusinessIntents0,proof "GITHUB_ACTIONS_LIVE_METADATA". Validar valores/tipos/ordem/ownData semgetter/símbolo/Proxy/revoked/protótipo hostil. Não criar ENV, arquivoDocR12, reportfield, reciboR12 ou membro22.

loadSingleRequestProof valida esse campo para nonceR13 antes de definir contexto privado, além de todos os guards existentes de identidade/hashGit/request/nonce/run/createdAt e freshness30s presecret. Zerar contexto/cache da prova no início, rejeitar ausente/crossproof/forjada; Master só consome cache local, zeroGET e semtoken. Provasmanuais não autorizam R13; nenhuma nova rota manual/dispatch/controlador. R4/R7 e todas as verificações atuais continuam.

## Histórico, RED e conclusão

RecoveryR11Doc12/blobaf4a3ca0b5017d4a422de41564063d4c82293f72/6130ASCII/SHA29f674764a2c8f953f764fcb6a40d8c330e441b488dfcab56a6ee4f9f389c423 mandatory intacto. Dez confirmadas+umareservada/base11/até13novas/teto24; ledgercorrente9/recovery10. HistóricoR11UNCERTAIN nunca promovido/reembolsado, usedIdaf968191-7d60-4adb-9c60-ebd5f0741e8e e solicitaçãoOct permanentemente gastos, mesmo UUIDnovo/linhaausente. Não repetir BUILD490 de negócio nem alterar17históricos/20dados+SHA21, relativos aos últimos raws reais R11. R12 não tem artefato/leitor.

RED causal antes código: novo nonce/spentR12/GATEancestor; positivos e negativos da matriz/origem/head/attempt/jobs/Step7 e16/artifacts/sourceSHA; prova ausente/crossproof/hostile/cacheantigo não autoriza; token/ENVhostil/Masterherdado bloqueados antesGET, cacheMaster0GET. Teste real dos mesmos validators, não cópia/falsoGit no runtime. Preservar negativos fixed11/client/pins do probe; probe público real só é comprovado com D válido e logCIHEADliteral. Sempular/fingir a execução por indisponibilidade.

GREEN: Node/helper30/protocolos/ESLint/Prettier/produto/TS/build/Zero/LOCK/TesteC aplicáveis, publicliveprobe e18nativas no HEADfinal: base8+visual1+sourceforms5+SYS042+V1121+V1231. Cinco títulos/TAP1..5/pass5/failcancelledskipped0/retorno5, sourceOrdering/preflightDrain/fábrica intactos; sem nova contagem. Revisão independente/merge protegido antes request separadoJSON7campos/nonceR13/approved_parent_sha real/blankpairAUTO_DISCOVER. Doischecks/canônica pinned/freshness antes merge normal; freeze até upstream+dois subscribers originais attempt1 terminais. Sem rerun/cancel/dispatch/Auth paralelo.

Somente após R13terminal e artefato real, leitor estático2mjs em PR separado sob este GATE: pins reais20dados+SHA21/HISTORY17, ledger9/recovery10, reserva excluída de currentconfirmed/CAU2, UNKNOWNpreservado. PolíticasFD/digest/toolpin/warnings/30s/envmínimo/bounds/diagnóstico6/4/fatal consistency intactas; CI/review/merge antes originalpushmainreadonly. Não leitorR12/ZIPmanual.

Atualizar checkpoint apenas com fatos integrados. Este GATE não certifica184/208/232/72/V1 nem sessãoMaster. Preservar18públicos/Run124204PNG102DOM307hashes/AUDIT_BINDING_PENDING e histórico integral.

# PLAN R8: revalidação GitHub autenticada antes de credenciais HML

Issue317/P0. Titular autorizou corrigir/testar/preservar aprovações/concluir184 sem autorizações repetidas. PLAN documental; GATE próprio, RED, BUILD, GREEN, revisão independente e merge protegido antes de novo request. Não repetir R7.

## Fatos e âncoras

Main atual50c7930d755acb9f3f0eef3385b51ee665a2665f, backend0e85578323ae272ba79915f9b872386d437cbc83, HMLREADY437c788e32f0325dd15c9d2e7277c10129bcb462/dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp/aliascontaos-41-hml.vercel.app. Revalidar antes de etapas dependentes. Após R7 terminal, PR464 C13 integrou50c sobreSbc7: PLANO, CopilotoContrato, AppShell, copilotoApi e teste. Preservar integralmente essas mudanças, suas aprovações/histórico; não reverter, certificar ou esperar C13. Este plano não altera SRC e não publica produto. Snapshot/ack backend0e e25fontes/cat10097/types8ea permanecem.

BUILD462 aprovado/integrado dc0d525f131f6c26e3b1e846b6a4e43e3cf3deb6, HEAD e37c3489da1441d97bd635d765678b3e79294a33: quatro CIs42600087542/42600087487/42600087661/42600087530SUCCESS, reviews5824520557/5824527608/5824535180zeroC/I. HelperLista4sites, REDcausal57e792/42599315521/129099580832, native15 emambosprotocolos,417/296testes,1169produto/42arquivos, recuperaR6/SHA98136.../manifest11/8+16 aprovados. Preservar tudo; a falha R7 aconteceu antes de exercitar o helper em HML.

REQUEST465 integrada Sbc7c1625f0a7851fe7b8f0500f3bf51daf1e1215 parentsPdc0/R8bc6b58c3f7a7f2b8c2b44ba1229c77b4fc369de, sóJSONblob8f0f159c0813107f523c4a75c754702f8363dc04, canônica5824572209 eCI42600936093/42600936040SUCCESS. Upstream42601246471/push/main/attempt1SUCCESS, LOCK42601246410SUCCESS.

R7original42601383933/workflow411426169/workflow_run/main/attempt1/completedFAIL; privatejob129106715983: native13SUCCESS noS10:33:27, publicProvenance14SUCCESS437/F3/110módulos10:33:36, revalidate15FAIL10:33:53 REQUEST_API_UNAVAILABLE, Master16SKIPPED, hash17/upload18FAIL por pasta inexistente; artifacts[]. Request129106437562SUCCESS/protocol129106439491SKIP. OpostoAudit42601384052SUCCESS/request129106437990SUCCESS/protocol129106440087SKIP/private129106589401SKIP. Todos originais terminais, sem rerun/cancel/dispatch.

ZeroAuth/zero novas operações R7 são DERIVADOS de Step16SKIP e fonteS examinada (workflow818af06317c72038abe23cd85f4a95f4ea4d1d3c, auditor ed7324f59364a103d572b45e4956573ed14a894f, preparer03f4a3a8d52b7ddc78ec7a34d32b8de6d47c173e): antes16 apenas metadados/provas públicas. Não há report/receipt/logout R7. LogoutN/A, bindingsausentes; não fabricar arquivos nem usar ausência de artefato como prova. Oito confirmações históricas e máximo16novas continuam. Checkpoint3176738048922 publicado/readback.

## Diagnóstico demonstrado e limite

singleRequestCli --request-revalidate fixa publicOnly=true nas etapas Recibo inicial publico para as fases sem credenciais e Revalidar main e unicidade dentro da concorrencia antes de secrets (R7: steps6 e15). Cada verifyfixturesSUCCESS exige mínimo24GETs (9R4+15outros), mais paginação/espera oposta. loadSingleRequestProof nas fases resolver deployment/preparação/execução privada (R7: steps7/14/16) lê arquivo/identidade/git/evento/digests/R4 local: ZERO GETs SINGLE_REQUEST. Não alegar96GETs por quatro processos.

REQUEST_API_UNAVAILABLE mistura catchfetch eHTTPstatus!=200; não preservou status/endpoint. Rate-limit,403/429/5xx,rede/redirect/timeout5s são hipóteses, não causas retroativamente comprovadas. Fato corrigível: autorização crítica depende de GitHubAPI pública não autenticada. O novo desenho autentica as mesmas leituras em processo sem Master e torna eventual falha futura diagnosticável por campos técnicos fechados.

Hoje ambosworkflows têm top contents:read; requestjob acrescenta actions:read; privatejob herda somentecontents:read; pull-requests:read não consta. O GATE precisa autorizar o delta de leitura explicitamente. Não presumir403 por isso: o repositório é público e preflight autenticado anterior passou; não depender dessa concessão implícita.

## Escopo de BUILD, seis arquivos existentes

- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs
- .github/workflows/contaos-trilha-a-authenticated.yml
- .github/workflows/contaos-trilha-a-fixtures.yml

Somente revalidação GitHub, provaR7zero/ledger/nonce e testes associados. HelperLista4sites, arquitetura frontend/Supabase, sourceproduct, public, tipos8ea, deps/lock, Bunhelper, sourceprovenance/fences, banco/RLS/RPC/AuthAdmin/servicerole/PROD e C13 não mudam.

## Separação de token e validação

Nos dois jobs privados, declarar apenas contents:read/actions:read/pull-requests:read; no requestjob, acrescentar pull-requests:read ao readset existente. Sem permissionwrite/OIDC/admin, novo PAT, segredo ou instalação.

Nos dois steps existentes de --request-revalidate (antes das fases públicas e imediatamente antes de Master), definir SOMENTE env.CONTAOS_ACTIONS_READ_TOKEN via contexto github.token efêmero. Nunca envglobal/job, GITHUB_ENV, output, proof, artifact, build/browser, StepMaster16 ou valorliteral. Token vive somente no processoNode que consulta metadados; credenciais HML só no step seguinte.

CLI --request-revalidate usa publicOnly:false e token obrigatório, sem fallback público. Guard antes de qualquer GET recusa variáveis Masteremail/password/DB/admin/service-role e aliases relevantes. Não retirar a verificação; exceção é o tokenGitHub específico dessa fase metadata-only. --request-preflight mantém token e mesmas provas. loadSingleRequestProof privado continua local, com fresh30s/identity/moduleHash/testHash/requestdigest/git/nonce/evento; não recebe token nem faz GET novo.

Preservar integralmente dois livechecks, main/ancestralidade/PRúnico/reviewcanônico/CI/attempt1/workflows/filas/opostoSKIP, fontesR4 originais, paginação completa e raceclose. Mesmos paths/hostGitHub, redirecterror, timeoutporGET5s/deadline60s, tamanho4MiB, sem retry nem cache/fallback para passar. BrowserEnvironment continua excluindo token e credenciais. Sem novo controller, proxy/API/endpoint de aplicação ou transporte.

Adicionar diagnóstico futuro fechado no ponto de falha: endpointKind de allowlist, statusHTTP inteiro100..599 ouNONE e categoriaHTTP/NETWORK/TIMEOUT/REDIRECTse comprovável. Sem statusText/body/header/rawURL/error.message/stack/token. Não inventar classe do erro R7 passado. Output só depois de guard e projeção integral, sem dump parcial. Erro original segue fail-closed. Testar canários/getters/Proxy/linhas extras/valores desconhecidos com zero vazamento.

## R7ZeroAuth, proveniência e orçamento

R7_ZERO_AUTH_PROOF de nove campos NESSA ORDEM:
schema contaos.fixture.recovery-r7.v1; headSha bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215; upstreamRun42601246471; fixturesRun42601383933; auditRun42601384052; privateJob129106715983; attempt1; derivedNewBusinessIntents0; proof GITHUB_ACTIONS_LIVE_METADATA.
JSONpretty2+LF,316bytesASCII,SHA256687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e, calculado independentemente em JS com selftestsvazio/abc. Não é report/receipt/logout.

Verificação autenticada somente metadados nos processos pré-secrets: três runs fixos + respectivosattempt1 +attemptjobs (9GETs), artefactslista[] (1GET), e blobsGitlocais das fontes originais. Validar repo/headS/branch/event/workflow/IDs/attempt1/status/conclusion e steps originais exatos: fixture13/14SUCCESS,15FAIL,16SKIP, opostoprivateSKIP, upstreamSUCCESS. Sem logs/artefatos/Auth/HML ou URL arbitrária. Fonte pinada comprova que pré16 não executa login/negócio.

Guardar proof9campos validado no receipt local de request. Master load valida esse objeto fechado sem GET; preparer valida com NodeProxy/ownDataDescriptors anteslogin/arm/runtimeSource. Sem ler getters/traps nem aceitar campos faltantes/extras. Erros novos somente enums fechados RECOVERY_R7_PROOF/RECOVERY_R7_LEDGER quando necessários.

Oito confirmações e maxNew16/teto24 preservados; não reexecutar R1/R3/R5, não reusar R1–R7. Persistir APENAS recovery-r7.json ao final, depois de receipts-r6/recovery-r6. Nunca criar receipts-r7/report-r7/logouttrue. Agora são11dados+SHA256SUMS=12membros,9históricos; oito dados anterioresR6 e seus bytes/hashes ficam intactos e os doisR6 já aprovados continuam. Report15campos/recovery10 permanecem sem novo campo.

## Sequência e DoD

1. GATE separado fecha paths6, readpermissions, envstep-only/guards, diagnóstico, provasR7/canonicalSHA, orçamento, nonce e futura leitura; PLANO/ESTADO preservam C13 e checkpoints anteriores. CI/revisão/integraçãoGATE antes de código.
2. RED causal CI offline para revalidateantigo publicOnlytrue/ausênciaguard/permission/env isolados e provaR7 faltante, sem chamarHML/Auth; não usar erroimport/sintaxe. Testes estruturais precisam demonstrar segurança efetiva, não apenas espelhar strings.
3. BUILD seis paths; testes Node, nativos15/fences/statusformulários/semverhelper e regressão produto atuais apósC13, ESLint/Prettier/TS/build/Zero/LOCK/TesteC aplicáveis. Testar nenhuma credencial HML no metadataGET/nenhumGitHubtoken no Master/build/browser/artifact, missingtokenfalha e non200/timeoutsemfallback. Revisão independenteHEADfinal/protectedmerge.
4. RequestR8 em PR distinto sóJSONsete campos, nonce trilha-a-fixtures-20261109-r8, approved_parent_sha mainrealaprovado, frontend_sha/deployment_id vaziosAUTO_DISCOVER. R7spent; manter AUDIT_BINDING_PENDING. CI2/canônicareview no commit/freshHEADs/HML antesmerge. Congelar main/deploy até originaisupstream/subscribersattempt1terminais. Sem rerun/cancel/dispatch.
5. R8 somente fluxo normal já aprovado de fixtures: reutilizar fonte/lista/Oct/Sep/documento, análise/aprovação institucional verídicas, Octdisponívelapresentar/Sepregistrado, não mutarNov/V114/V115/V116/V118. Falhas geram prova e correção, não afrouxamento.
6. Se existir artefatoR8 terminal, PR distinto SOB ESTE MESMO GATE retargeta estaticamente apenas scripts/hml/inspect-fixture-artifact.mjs, .test.mjs e workflowcontaos-trilha-a-fixture-inspection.yml se necessário. Pins só de APIreal:run/head/upstream/artifact/nome/tamanho/digest/jobs/status. ExpectedFILES11+manifest12/HISTORY9 com doisR6 e recovery-r7SHA687712..., enumnovo do produtor comprovado. Manterpolítica459/FD/NOFOLLOW/limites/Node24/downloaderoficial/capturaprivada/cryptoNativo/30s/zeroPII: corewarning/coreerror/digestwarnings bloqueiam, NodeDeprecationstderrprivado permitido como já aprovado. CI/review/mergeantespushmainreadonly. Não ler R7artifact inexistente, não criar controller/crypto/workflow/inputsgenéricos nem Authextra.
7. Root/revisor conferem evidências originais, hashes, recibos/ledger/logout/bindings; atualizarcheckpointGitHub. Bindings finais exigem GATEaudit próprio, depois auditoria208/SHA/screenshots/DOM/revisão/ledger184/72. Não confundir fixturesprontas com24casosPASS.

Preservar18públicosPR324 e Run124204PNG/102DOM/306hashes+revisões, sem repetição sem regressão. Separar24baselineprivados de24fixturecombinations, 184originais=96provisórios+56privacidade+8UI+24fixture. 232teóricos/72/V1 não certificados por testes de protocolo. V1segueNÃO CERTIFICADA; V2/PROD bloqueados. Rollback viaPRrevisado, sem replay/compensação/alteração de negócio.

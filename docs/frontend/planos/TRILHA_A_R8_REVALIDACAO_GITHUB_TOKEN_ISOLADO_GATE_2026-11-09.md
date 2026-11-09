# GATE R8: token GitHub isolado na revalidação pré-secrets

Incorpora integralmente PLAN466 docs/frontend/planos/TRILHA_A_R8_REVALIDACAO_GITHUB_TOKEN_ISOLADO_PLAN_2026-11-09.md, HEAD80fbf1749304a415592bdec03304801b8b0102a5/blobe7ad1ab52364af758c745c170436cd9823f8fa83, review5824813022zeroC/I, CI42604054248/42604054088SUCCESS, mergee61bea0548d20a48c4e927cb97eef0a62a6b3e33/parents50c+80fb verificados. Este GATE não executa Auth, SQL ou mutações. Autorização contínua expressa do titular/P0, sem novo aceite repetido.

## Âncoras e preservação

Basee61bea/50c7930d755acb9f3f0eef3385b51ee665a2665f preserva C13PR464 (PLANO432c002ade04ee0a0394b850386ebad5fd343628 e quatroSRC/testes), BUILD462dc0/e37 e todas fontes/approvals. Backend0e85578323ae272ba79915f9b872386d437cbc83;25normativas/catalog10097/types8ea7750b75fd9d76b29c36ce7613392e3ab65e19 preservados. HMLREADY437c788e32f0325dd15c9d2e7277c10129bcb462/dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp/aliasoficial, fonte produto diferenteharness intencional/AUTO_DISCOVER. Não redeploy por harness nem reatribuir C13novo ao produto437.

R7originalSbc7c1625f0a7851fe7b8f0500f3bf51daf1e1215/upstream42601246471SUCCESS/fixtures42601383933FAIL/audit42601384052SUCCESS, todosattempt1terminais. Private12910671598313nativeSUCCESS/14publicProvenanceSUCCESS/15revalidateFAILREQUEST_API_UNAVAILABLE/16MasterSKIP/17hashFAIL/18uploadFAIL, artifacts[]. Fonteworkflow818af06317c72038abe23cd85f4a95f4ea4d1d3c/auditored7324f59364a103d572b45e4956573ed14a894f/preparer03f4a3a8d52b7ddc78ec7a34d32b8de6d47c173e examinadas: pré16nãoAuth/negócio. ZeroAuth/zero novas intenções R7 DERIVADOS de metadados+fonte, não de ausência/tamanho de artifact. Não existem report/receipts/logoutR7. Não repetirnonceR7 nem inferirHTTPstatus passado/rate-limit; ambos desconhecidos.

## Allowlist seis caminhos de BUILD

- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs
- .github/workflows/contaos-trilha-a-authenticated.yml
- .github/workflows/contaos-trilha-a-fixtures.yml

Escopo: revalidate/token/guard/diagnóstico técnico/proofR7/nonceR8 e testes. SemSRC/public, deps/lock, Bunhelper, types, arquitetura/backend/Supabase/SQL/RLS/RPC/AuthAdmin/servicerole/PROD ou controlesnativos alterados. HelperLista4sites462 e respectivas15provas preservados, não retrabalhar problema já corrigido.

## Readpermissions e token por etapa

Doisprivatejobs: declarar EXATAMENTE contents:read/actions:read/pull-requests:read. Requestjobs: acrescentar pull-requests:read ao contents/actions:read já existentes. Demaisjobs e triggers não mudam; nenhuma write/OIDC/admin/PAT/novo secret/installation. Sourceobservado privateherdavasócontentsread; autorizaçãoédelta de leitura explícito, nãoalegação403necessárioemrepopúblico.

Somente duas etapas por workflow recebem env.CONTAOS_ACTIONS_READ_TOKEN:${{ github.token }}:
1. Recibo inicial publico para as fases sem credenciais.
2. Revalidar main e unicidade dentro da concorrencia antes de secrets.
R7GitHubAPI numerouessas6/15, não5/15; usar nomes como contrato estrutural. Cada processoNode é exclusivo metadados; não executa build, browser ou login. Nunca tokenem envglobal/job/StepMaster16/GITHUB_ENV/output/proof/artifacts/gitpersistcredentials/flagsCLI. Email/password HML apenasno step Masterseguinte. Não criar/atualizar secrets.

CLI --request-revalidate exige token e publicOnly:false. Preflightautenticado mantém semântica. Nenhum fallbackpúblico quando tokenausente/HTTPerro/rede; falhaantesdeautorizar. Guard antes de qualquermetadataGET recusa Masteremail/password, database/admin/service-role e aliases; deve consultar ENV EFETIVO do chamador (inclusiveinjetadotestes), não process.env divergente. Tokenmetadata específicoéúnico permitido nessa fase. Token/canário nunca em mensagem.

Mesmos fullchecks duplos de main/PR/canônica/CI/ancestralidade/nonce/attempt1/workflow/filas/opostoSKIP/R4live/paginação/raceclose. Mesmos paths/host,redirecterror,5sporGET/60sdeadline,4MiB,semretry. Não usar cache/timing/backoff ou tolerância de status para forçarPASS. A melhoria é autenticar a leitura, mantendo o verificador.

Master workflow_run usa loadSingleRequestProof LOCAL: arquivo8192B, schema/operation/S/runID/digest/request/identidade/module/testhash/git/event/R4 eR7, fresh30s anteslogin. Resolverdeployment/preparação pública tambémlocal sem token. BrowserEnvironmentwhitelist continuaexcluindo credenciais/token; sourcebuilder/child recebem ambiente semtoken. Exigir guard prélogin que recuse CONTAOS_ACTIONS_READ_TOKEN/GITHUB_TOKEN/GH_TOKEN no processoMaster.

## Fechamento do ramo manual legado

R8privado é autorizado SOMENTE por workflow_run/requestJSON novo. Nenhumdispatchmanual seráexecutado. O ramo loadSingleRequestProof(workflow_dispatch) contém9GETR4legados e NÃO pode executá-los comMaster/DB/admin/servicealiases: mesmo guard antes de QUALQUERGET, usandoenvdo chamador. Testar manual+cadaalias→zeroGET/zerologin. Caminhoslegadospúblicossemcredenciais podem mantercomportamento, sem novo token/step/trigger/fallbackmanual. Retorno truelegado NUNCA dispensa proofR7 obrigatório do preparador anteslogin/arm. AusênciadeproofR7 ou tentativaManualR8privada falha fechada. Workflow_run+Master mantémloadlocalpermitido/zeroGET e rejeitatokenGithubindevido, sem bloquearloginválidoapósprovas.

## Diagnóstico técnico fechado

singleRequestGet conserva failclosed; opcionalcallback/projeção somente paraCLImetadataapósguard, nunca loggergenérico deobjetoerro. Campospermitidos: schema/phasefixos, endpointKind emenumfechado derivadodepathconstruídovalidado (não URLraw), statusHTTPinteiro100..599ouNONE, categoriaHTTP/TIMEOUT/TRANSPORT. TIMEOUTsomenteAbortSignalpróprioabortado; TRANSPORTagrega rede/redirect/TLSnão distinguíveis, sem especular. NenhumstatusText/body/header/error.message/stack/token/authresponse/DOM/HAR/cookie/storage. Nuncaacessar getters/Proxydeerroparaexplicarcausa; apenasdadosconfiáveis/projetados.

Teste403/429/5xx/rede/timeout/redirecterror/canáriosextras/tokenausente comumaúnicafalha e nenhumaautorização/fallback/retry. MensagemR7antiga permanece desconhecida; novo diagnóstico só seaplica aexecuçõesfuturas. Falhaanteshash/upload porfaltaartefatonãoécausaMaster.

## Prova R7zero, sem dados fictícios

R7_ZERO_AUTH_PROOF nove campos nestaordem:
schema=contaos.fixture.recovery-r7.v1;
headSha=bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215;
upstreamRun=42601246471;
fixturesRun=42601383933;
auditRun=42601384052;
privateJob=129106715983;
attempt=1;
derivedNewBusinessIntents=0;
proof=GITHUB_ACTIONS_LIVE_METADATA.
JSONpretty2+LF316ASCII/SHA256687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e.

verifyR7ZeroAuth somente10GETs autenticados pré-secrets: três runsfixos+attempt1+attemptjobs eartifactlist[]. Validaridentidadesrepo1442722734/headS/branchmain/event/workflow/attempt/status/conclusions/IDs, stepsoriginaisconformes/fontesGitblobsS pinados. UpstreamZeroSUCCESS/TesteCconforme, fixturepreflightSUCCESS/protocolSKIP/privateFAILcom13/14SUCCESS15FAIL16SKIP17/18FAIL, auditpreflightSUCCESS/protocol/privateSKIP. Não compararJSONinteirosnemtimestampsrun==attempt: metadadosreais differem1segundo. Timestamps válidos por campo/proveniência quandoexigidos; seminventarvalorúnico. Semlogs/download/Auth/HML/URLarbitrária.

Guardarproofvalidado noprooflocalde request, validarclosedshapeantesMastersemGET. Preparer valida9fields/números/strings/digest comNodeisProxyantesreflexão/ownDatadescriptors/zero getters e símboloextra, anteslogin/brokerarm/runtimeSource. Errosnovosfechados RECOVERY_R7_PROOF/RECOVERY_R7_LEDGER apenas. Metadatafailnãoviraresultadonegócio.

Oito confirmações históricas+maxNew16/teto24 inalterados; R1–R7spent; semreplay/compensação. Writerpreserva os10dadosR7planejados (8históricosanteR6+receipts-r6/recovery-r6) eAPPEND APENAS recovery-r7.json9keys316/SHA687712. Nunca report-r7/receipts-r7/logouttrue. Manifesto11dados+SHA256SUMS=12membros/HISTORY9; ordem10nomesatuais+recovery-r7.json, todoshashesanterioresintactos. Report15/recovery10 inalterados.

## RED→BUILD→GREEN

1. RED CI offline causal antesfix: revalidateantigo usa publicOnlytrue/nãorequer token/permitiriaMasteremmetadata eproofR7ausente; validar comportamento viainjeçõesreais/CLIcontract eparserworkflowoucontrolesestruturaisnegativos, não somente espelharliteral. SemAuth/HML/SQL; nenhumimport/syntaxfailurecomoprova.
2. Implementarsomente6paths. Negativos tokenemjob/global/Step16/build/browser/proof/GITHUB_ENV, writes/OIDC/scopesfaltantes, Master/DB/admin aliasesantesGET, missing/extra/tamperedR7proof/rootProxy/protoProxy/getters/canários/nonceR7replay. Positivo tokenmetadataefêmero/guardsemMaster/envinjetado/autorizaçãoinalterada/eight+sixteen/localfresh30s. ManualMasterzeroGET/zerologin; workflow_runMasterloadlocalpositivo.
3. ProvarR7metadata exatoscomfixtures dos10GETs originais jálidos; pinnedsource13/14/15/16, artifactszero, changedhead/attempt/step16executado/extrajob/artefato/alias/tipodesconhecido falham anteslogin. Writer12membros/11linhas/hashesoriginais preservados.
4. CI atual: Node/nativos15/fences,helper30,produto+TypeScript/build/lint/Prettier/Zero/LOCK/TesteC aplicáveis apósC13. Não assumir1169históricossecontagemprodutoC13mudou; registraroutputatual. Fontescorrentes/backendfreshness/types8ea. RevisãoindependenteHEADfinal eprotectedmerge. NadaAuthR8antesdisso.

## Request único R8 posterior

SomenteapósBUILDverde/revisado/integrado, PRdistinto sóJSON7campos operationfixtures/request_id trilha-a-fixtures-20261109-r8/paiaprovadomainreal/frontend_sha e deployment_idvaziosAUTO_DISCOVER. AdicionarancestralidadedesteGATE semremoverGate461/outros. R7spent/auditAUDIT_BINDING_PENDING. DoischecksSUCCESS/canônicareviewcommitpinned/freshHEADs/HMLantesmerge, congelarmain/deployatéoriginaisattempt1terminais. Nãorerun/cancel/dispatch/novoJSONduranteexecução.

Executarapenasoperaçõesnormaisjáaprovadasda fonte/lista/Oct/Sep/documento eanálise/aprovaçõesverídicas, registrarsomenteSep/Octdisponívelapresentar; nãoalterarNov/V114/V115/V116/V118. Sem backend139a menosdependênciademonstrada. Resultadoactualsempreantesinferirrecibos/bindings/logout.

## Leitor R8 após terminal, PR separado sob este GATE

SeR8produzirartifactterminalreal, autorizaPRdistinto nos3existentes: scripts/hml/inspect-fixture-artifact.mjs, .test.mjs eworkflowcontaos-trilha-a-fixture-inspection.yml SOMENTEsenecessário. Retargetliteralidentity/run/head/upstream/artifact/nome/tamanho/digest/jobs/status reais; appendHISTORYR6dois+R7um(hash687712)/expected12members/11manifest e enumprodutornovocomprovado. Semtargets/inputsURLsgenéricos/controlador/crypto/newworkflow/Auth. NãoexecutarleitorparaartifactR7inexistente.

Preservarpolítica459: Node24builtins,tooloficiald3f86a106a0bac45b974a628896c90dbdf5c8093/bundle374211f852b2a8155a0211c72e85dacc81bb69f3, digestcalculado/capturaprivada,corewarning/coreerror/digestwarningsbloqueiam(NodeDeprecationstderrprivadopermitidoconforme459),deadline30s/1MiB/bounds/FDNOFOLLOW/manifest/roles/zeroPII/semoutputparcial. CIunit/review/Zero/LOCK/lintfmt/protectedmergebeforepushmainreadonly. Root+revisorconferemoriginais/hash/recibos/ledger/logout/bindings.

PLANOmantertodosvalores/pathsC13/462/461e acrescentar2docsPLAN/GATE+seçãoR8. STATEpreservarsufixointegral+checkpointverdadeiro.184casosoriginais/24fixtures/208/232/72/V1nãoencerradosporesteGATE;18públicosPR324/Run124204PNG102DOM306hashes e C13 preservadossemrepetiçãoinjustificada. Apósbindingsverificados,GATEauditespecíficoantes208screenshots/DOM/SHA/revisão/ledger184/72. RollbacksóPR,semnegócio/PROD.

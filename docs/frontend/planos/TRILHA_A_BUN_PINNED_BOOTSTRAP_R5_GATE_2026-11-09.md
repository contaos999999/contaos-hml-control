# GATE: bootstrap Bun1.4.4 pinned e recuperação R5

PLAN447 integradoedb471ce11e178ad25f2492723c63eab1ab81313, HEAD32a2568c77c432c3f19d6666ac36a381c75f9415; CI42569528706/42569528738SUCCESS, revisões5822093725/5822096528. EsteGATEsomente documental; CI/review/merge próprios antesBUILD. Preservaattempt1/R4consumido; nenhumaAuth ou retryR4.

## Pins oficiais fechados

Pacote @oven/bun-linux-x64@1.4.4,linux/x64,metadataoficialbun1.4.4optionalDependencyexata,repooven-sh/bun. Fontes https://registry.npmjs.org/bun/1.4.4 , https://registry.npmjs.org/@oven%2fbun-linux-x64/1.4.4 e https://bun.com/docs/installation. Metadatainvestigadaautor/Rootindependentecmd_eb2776eb22ff433989f77ed26c5csemexecbinário; nãoalegaequivalênciabitabitcomzipGitHub504.

Downloadruntime SOMENTE https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz . Não consultarmetadataruntime, npm install/lifecycle, mirrors, fallbackGitHub, caches, latest ou hashaprendido.
- SRI sha512-CHbbkmHVM28T1GFq+6GL4Ao4ujwwYwj1CxFFwEFzLanPfNsId9AhbIP0Q4reWuWBkGimUkoQygrK7Rgjtj3vog==
- TGZ52418437bytes/SHA25693ca5a2abe45f3bcac6dd55baff8bb06c4ac824b70f89650b54e5c8b80dbef18.
- Binpackage/bin/bun107308936bytes/SHA25610702245766b225e70bbf6235fd6b47214fd94b4760d00ffaed8ab0df57ac235;ELF64littleendian/machine62.
- Exatamente3arquivosregulares:package/bin/bun,package/package.json,package/README.md. Metadatapackage/version/os/cpu devem serexatos,semexec.

## Aquisição, extração e publicação

Node24builtinssemdependênciasnovas. Somentelinux/x64,HTTPSúnicoorigin/URLliteral acima,semuserinfo/query/fragment. RedirectDENYsempre,qualquer3xxfalha,semfollow. Status200 ebodybounded64MiBcomlimite enquanto streaming,contentlength quando presente coerente. Deadlineúnicoend-to-end30s cobrindodownload,gunzip/parse,write,version;abort/cancelcloserecursos. Semretriesautomáticosnestehelper,semextendertimeoutdinâmico.

Verificarbytesexatos+SRIsha512+tgzSHA256ANTESgunzip. Gunzip commaxOutputLength128MiB e validação de stream completo; se trailer inválido,extra gzipmember/bytes ouambiguidade não suportada, bloquear. Parsetarchecksum/size/mode/type/path/termination/padding rigoroso, exatamente dois blocosEOFzero e somente paddingzero final; negarconcatenação/trailerambíguo. AceitarapenasUSTARregular e3entradasexatasuniques; negarPAX/GNUlongname/sparse/links/symlinks/hardlinks/devices/directoriesextras,duplicatas,pathabsolute/backslash/traversal/NULinterior/entrysizeoverflow/paddingnãozero/headerambíguo/trailingnãozero. Não usar shelltar ou extrairconteúdoarbitrário.

Anteschmod/execverificarbinSHA/tamanho/ELF,packageJSONstrictfieldsnecessáriossemduplicatasambíguas,nomeversãoOSCPU. Escrita somente dobinário emdiretório novo mkdtempprivado0700 dentroRUNNER_TEMPabsolutocanônicoreal,nãoreusável/nãosymlink. Arquivowx0600,verificarpóswritehash/tamanho/lstatregular,nãooverwrite,entãochmod0700;usarO_EXCL/O_NOFOLLOWondeaplicável e revalidarhandle/pathidentidade. Sequalquerfalha,cleanupdo diretóriopróprio semseguirlinks; não modificaroutraspaths.

RUNNER_TEMP obrigatórioabsoluto e realpath=lstatsemcomponentesymlink,dirreal; GITHUB_PATH obrigatórioabsoluto/regular/nãosymlink no diretóriocanônico doRunnercommandfiles vinculadoaRUNNER_TEMP. Ohelper falha seausentes/relativos/foraescopo,semusarCWDou/tmpfallback. Tratarvariáveiscomo dados,semexpansãoshell. NãoaceitarCLIURL/hash/patharbitrário nemcallbacks paraexecprod. Nãoexporenv/payload/caminhocomsegredo.

Somenteapósintegridadetotal ewriteverificado executar caminhoABSOLUTO dobinário com --version,envVAZIO(noHOME/BUN*/NODE_OPTIONS/LD_PRELOAD nemherança),cwdtemppróprio,timeoutlimitadoprazo restante; exigirsaídaexata1.4.4. Não invocar bunpreexistente/PATHprimeiro. Apenasdepois publicar diretórioabsoluto validado emGITHUB_PATH; seprecisarbumx,criarlinkcontroladobunx→bunno diretóriopróprio,negarpayloadlink. SeGITHUB_PATHwritefalha,helperfalha e nãodeclarainstalado. Sucessopreserva bináriopróprio atéfimdojob paraosstepsBun;falharemovetemppróprio. Atécompletar,nãoexec/BunPATHwrite. Logsomenteenum/checksumsconstantes/versão,piorerrofechado,semerrobruto/URLdinâmica/env/tokens.

## Sete steps e Node

Substituir7usesoven-sh/setup-bun nas3workflows,semnovajob/permissions/if/environment/concurrency/secrets/workflowtrigger:
| Workflow/job | Identidade preservada do step |
|---|---|
|contaos-frontend-zero-drift.yml/frontend-quality|Setup Bun|
|contaos-trilha-a-authenticated.yml/request|step anteriormente semname (preservarposição/semrename)|
|contaos-trilha-a-authenticated.yml/protocol|step anônimo; preservarposição/identidadegerada|
|contaos-trilha-a-authenticated.yml/private|step anônimo; preservarposição/identidadegerada|
|contaos-trilha-a-fixtures.yml/request|step anônimo; preservarposição/identidadegerada|
|contaos-trilha-a-fixtures.yml/protocol|step anônimo; preservarposição/identidadegerada|
|contaos-trilha-a-fixtures.yml/private|step anônimo; preservarposição/identidadegerada|

Todos run node scripts/ci/install-pinned-bun.mjs antesbuninstallfrozenlockfile; Auth/FixturesjáNode24,Zeroacrescentaactions/setup-node@v4node-version24anteshelper. Semalterardependências/lock/comandosfrozen/tests/build; ZeroaindaprovefreshnessantesBUILD; bootstrap/testesocorremantespassodecredenciaisprivadas. NomeSetupBun doZero permanece; seisstepsanonimos preservamposição e não precisamname novo. Executar unithelpers eCLIsemBun/appdeps emNode24antesinstalardependências; preservarordemderito/native.

## R4 zeroAuth: provaActionsread-only exata anteslogin

Contextofixo repo contaos999999/contaos-hml-control,requestR4HEAD4c3a92b3fbf3160b3c67751355a4ef8f91c70d72,attempt1:
- Upstream42568309807,workflow406076025,path.github/workflows/contaos-frontend-zero-drift.yml,eventpush,main,completed/failure; job128999621110ContaOS Frontend Zero-DriftfailedSetupBun ejob128999621372TesteCsuccess.
- Fixtures42568382053,workflow411426169,path.github/workflows/contaos-trilha-a-fixtures.yml,eventworkflow_run,main,attempt1,completed/skipped.
- Audit42568382029,workflow411115674,path.github/workflows/contaos-trilha-a-authenticated.yml,eventworkflow_run,main,attempt1,completed/skipped.

Na prova GitHubmetadatasomente, GET /repos/{repo}/actions/runs/{cadaID} e /actions/runs/{cadaID}/attempts/1/jobs?per_page=100&page=N; validar IDs/repo/head/path/event/branch/attempt/status/conclusion. Não exigir campo upstream_id/workflow_run.id no objetoRESTfilho: ele não existe nessaresposta. Vínculo causal porjoin de HEADS/workflowID/path/event/main, triggerfonteconferido workflow_run workflows=['ContaOS Frontend Zero-Drift'],types=[completed],branches=[main] emS4c3a92 e upstream único42568309807; metadadosemvezdeparentinventado. ComprovarjobsprivadosrespectivosSKIPPED(não inferir sórunskipped); nãosuccess/cancel/failure/startedprivado. GET /actions/workflows/{workflowID}/runs?head_sha={HEADR4}&event=workflow_run&per_page=100&page=N paraworkflowFixtures/Audit; validar total_count/uniquenesscompleto eexatamente1runparaHEADR4emcadaworkflow. Paginação máxim10páginas/1000rows,IDsuniques/totalestável;failHTTP/schema/cap/duplicado/outroattempt/unknownjob/statusdivergente bloqueia. Semlerlogs/artefatosAuth/secrets ou novosendpointsHML. ReutilizarhelpersGitHubread-onlyheadersleastprivilegeexistentes; GHactions:readsomente requestpreflight,nãoexpandirAuth.

Tabela normativa das evidênciasREST (somente campos realmente presentes):
| Objeto | Campos fixos/join |
|---|---|
|Upstreamrun42568309807|id,workflow_id406076025,head_shaS4c3a92,head_branchmain,eventpush,pathZero,statuscompleted,conclusionfailure,run_attempt1,repository/head_repositoryrepoexato;created_at2026-11-09T05:36:46Z,updated_at2026-11-09T05:37:28Z|
|Fixturesrun42568382053|id,workflow_id411426169,head_shaS4c3a92,head_branchmain,eventworkflow_run,pathFixtures,statuscompleted,conclusionskipped,run_attempt1,repoexato;created_at2026-11-09T05:37:31Z,updated_at2026-11-09T05:37:41Z|
|Auditrun42568382029|id,workflow_id411115674,head_shaS4c3a92,head_branchmain,eventworkflow_run,pathAudit,statuscompleted,conclusionskipped,run_attempt1,repoexato;created_at2026-11-09T05:37:31Z,updated_at2026-11-09T05:37:32Z|
|Jobsattempt1|job.id,name,status,conclusion,steps; validarprivadoSKIPPEDsemstepsautenticadosexecutados;timestampsmetadatadejobskippednãoélogin|
|Listagensworkflowruns|total_count,workflow_runsIDsuniques/event/head/path/repo; exatamenteumupstreampushZeroeumfilhoworkflow_runporworkflowparaS|
|FonteYAMLemS|Authblob45f9d90094cc68aaeb22f5f170d20c2abcfa8159/Fixturesblob9fc9fc40d67394dd92cfaa63d7fe25ea6c2f4316,triggercompletedZero/main e ifsoriginais; ler gitshowS:path no checkoutcomancestralidadejáprovada|

Exigirordemtemporalclosed criadafilhos>=updated_atupstream e timestampsliteraisacima/coerentes; nãoinferircausalidadesóporhorário. Enumerartambém GET /actions/workflows/406076025/runs?head_sha={HEADR4}&event=push&per_page=100&page=N sobmesmacap para provarupstreamúnico. Seeventpayloadlocaldisponível, somente usarfonte jáconferida; nãoinventarfieldRESTnemnovaredeAuth.

LedgerR4constante minimizeIDs/HEAD/workflowpaths/attempt/conclusões+proveniênciacomGitHublivebound. Não reportprivadoinexistente. derivedNewBusinessIntents0 porqueambasfasesprivadasnãoiniciadas+metadataexata; nãoestendercount3porassunção. PreservarR1/R2/R3ledgers/hashese3confirmadas,count3remaining21,deny3RPCs; R1/R2/R3/R4históricospent,R5literaltrilha-a-fixtures-20261109-r5únicoexecutávelapósBUILDintegrado. NãoexecutarR4attempt2,mesmoendpointdownloadrecuperar.

## Allowlist e TDD

Só9paths apósGATEintegrado: scripts/ci/install-pinned-bun.mjs e .test.mjs;3workflowsacima;4existentes scripts/hml/prepare-visual-fixtures.mjs/.test.mjs e authenticated-visual-audit.mjs/.test.mjs paraR5histórico/provaR4somente. SemSRC/public/types/deps/lock/backend/PROD/factory/cercas/networkpolicy. Exceção fechada de triggerpaths: permitir somenteadição dosdoispathshelpers acima aos filtrospaths deCIAuth/Fixtures paraque futurasmudançasnesseshelpers reexecutemprotocolosnativos; nãoalterarif/private/eventconditions,permissions,environmentoutriggersemânticaalém desses2paths. NenhumGITHUB_TOKENadicionadopassoprivado;requestproofviametadatanãorecebecredenciaisHML.

REDcausalmetadata/setup504 e oldnonceR4executávelapósconsumo;GREENhelperpositivooficialpin/linuxx64/Bun1.4.4real e negativosURL/redirect/bodylimit/deadline/size/SRI/tgz/binSHA/tarambiguidade/symlink/duplicate/relativeenv/pathsymlink/unsupportedOS/versionerrada. Assert0exec/0PATHwriteantesintegridade,canáriosenv/URL/errobrutoausentes,cleanuppróprio. Networkmocksonlynosnegativoshelper/testes,produçãofixorigidosemcallback.

R4proofnegativosrunID/head/attempt2/privateexecutado/runextra/páginaincompleta/apierror/budgetcap epositive3+21deny3. Workflowtestsasseguram7helpers/Node24/comandosfrozen/gates/secretsconcurrencyinalterados. Preservarnative15factuais,Run78visual/sourceforms e todaidentidadefactory.

CIHEADfinalZero/LOCK/protocolos/nativeGREEN+reviewindepantesmergeBUILD;depoisrequestR5separado1JSON/7keys/parentvivo/nonce/CIreview/ancestry/attempt1. Não rerunR4 nemAuthporGATE.184/72/V1nãocertificados;AUDIT_BINDING_PENDINGpersiste.

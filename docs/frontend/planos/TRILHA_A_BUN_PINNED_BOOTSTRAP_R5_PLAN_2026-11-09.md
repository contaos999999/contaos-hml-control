# PLAN P0: bootstrap Bun1.4.4 íntegro e retomadaR5 sem replayR4

Estado PLAN somente; exigeCI/revisão/merge e depois GATE separado antesRED/BUILD/GREEN. Não implementa bootstrap nem autorizaAuth/request/R4rerun. Base observada4c3a92b3fbf3160b3c67751355a4ef8f91c70d72; backend7f9e42abf29434103e4e1ac128c5206a3347bf46. EscopoexclusivoCIharness, semproduto/PROD.

## Falha comprovada e limites

R4S4c3a92: upstream42568309807/job128999621110 falhou no SetupBunlatest1.4.4 HTTP504 em três tentativas; freshness7f passou antes. É segunda falha de downloadBun na troca de main, independente do código de negócio. Fixtures42568382053 e Audit42568382029 SKIPPED; nenhumAuth iniciado segundo conferência do coordenador. Registrar zero novas operações como derivação de jobsprivadosSKIPPED +falta de abertura da faseautenticada/broker, não campo intentCount inventado. Anexar noGATE provenance/workflow/HEADs/jobsconclusões/artefatos disponíveis, sem presumir logout de sessão que nãoexistiu.

Não executar run_attempt2: protocolo exige upstreamattempt1, R4nonce já consumido pela integração e história. R1/R2/R3/R4 ficam spent; não editarrequestconsumido nem relaxar unicidade para reaproveitarCI. Nenhuma novaAuth só para diagnosticar download.

## Solução proposta, mesma ferramenta

Substituir somentebootstrap das trêsworkflows indicadas por aquisição explícita do pacoteoficial @oven/bun-linux-x64@1.4.4 no registryoficial, com integridade fixa de tarball e SHA256fixo do binário, arquitetura/plataforma e versão1.4.4exatas. Não Bunlatest/upgrade/downgrade, npmexecution/installscript, fallbackdinâmicoouhashobtidoeaceitodamesmarespostanãoconfiável.

Investigação do autor deve obter metadataoficial/proveniência antes doGATE: registryURL/tarballURLliteral, package/version/os/cpu, dist.integritySRI, tarballSHA256, tamanho máximo e caminho/hash/tamanho dobinário. Recibo técnico informado pelo autor após investigação sem executarbinário: VM11cmd_e2b18fe1d72a40e9b37906835e29, cmd_a9338192e5e8404393822bba9c82 e cmd_353b96a5582c46c7b3580dff36b8; pacoteoficiallinux/x64, repo git+https://github.com/oven-sh/bun.git. URL https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz ; SRI sha512-CHbbkmHVM28T1GFq+6GL4Ao4ujwwYwj1CxFFwEFzLanPfNsId9AhbIP0Q4reWuWBkGimUkoQygrK7Rgjtj3vog== ; tarball52418437bytes/SHA25693ca5a2abe45f3bcac6dd55baff8bb06c4ac824b70f89650b54e5c8b80dbef18. Binpackage/bin/bun107308936bytes/SHA25610702245766b225e70bbf6235fd6b47214fd94b4760d00ffaed8ab0df57ac235,ELF64machine62. Tartrêsentradasregulares(package/bin/bun,package/package.json,package/README.md). Este é recibo do implementador, ainda sujeito à revisão independente e fixação literal noGATE; não autoriza instalação/execução por estePLAN. GATEposterior fixa-os literalmente e revisa fonteoficial/artefatosemexecutarbinário até verificações de integridade. Nenhuma leitura de credenciais, tokenNPM ou endpointsHML.

Helperposterior Node24, invocado antesbun/dependências/segredos, limitespropostos paraGATE:compressed64MiB/uncompressed128MiB/timeout30s,semcache/fallbackGitHub e semconsultarmetadatamutável emruntime. Download HTTPS somente allowlistliteral registry.npmjs.org e URL/versionfixos, status200 e tamanho bounded; redirects proibidos ou encadeamento literalexplicitamenteaprovado peloGATE, nunca hostarbitrário. ConferirSRI antesextração; extração segura para diretório temporário próprio semsymlink/hardlink/absolute/traversal/dispositivo/extras executáveis inesperados. Conferirpackage metadata/allowlistexata de entradas ehashbinário anteschmod/exec. Somente então validar bun--version==1.4.4 e publicarPATH/GITHUB_PATH de caminho próprio validado. Paths semsegredos; nunca usarcommandoutput remoto paraeval/shell.

SemdesabilitarTLS/proxy/certificados/guard, semsudo ou dependênciaglobal. Sem execução de lifecycle npm. Falha integridade/origem/plataforma/versão/extraction fecha antesqualquerdep/Auth. Repetição detransporte estritamente bounded e definidaGATE, sem baixarlatest/hashalternativo; não trocar mirror silenciosamente. Evitar depender do mesmocanalGitHubrelease504 como fallback. Cache sóse chave incluios/cpu/version/SRI/binarySHA e revalidação total; nãoadicionarcache neste ciclo se nãofornecessário.

## Escopo futuro mínimo, somente apósGATE

Dois helpersCI propostos:
- scripts/ci/install-pinned-bun.mjs;
- scripts/ci/install-pinned-bun.test.mjs.

Trêsworkflows existentes:
- .github/workflows/contaos-frontend-zero-drift.yml;
- .github/workflows/contaos-trilha-a-authenticated.yml;
- .github/workflows/contaos-trilha-a-fixtures.yml.

QuatroMJS existentes para nonce/histórico/ledger somente:
- scripts/hml/prepare-visual-fixtures.mjs;
- scripts/hml/prepare-visual-fixtures.test.mjs;
- scripts/hml/authenticated-visual-audit.mjs;
- scripts/hml/authenticated-visual-audit.test.mjs.

GATE deve enumerar as SETE ocorrênciassetup-bun nas trêsworkflows(Zero1/Auth3/Fixtures3) e reproduzir mesmaBun1.4.4, sem mudarjobs/if/permissions/environment/concurrency/secrets/nativefactory/source/freshness/request/broker. Zerohojeusesetup-bun@v2 semversãoexplícita; Auth/Fixtures fixam1.4.4 emtrêsjobs cada. HelperNodeprecisa Node24comproveniência noZero; definirnoGATEbootstrapNodecompatível anteshelper, semcadeiadeinstalaçãodisciplinaralheia. Nãoalterarworkflowfora desses3,lock/package/deps,Source/public,types,backend,RLS,Authconfig,PROD.

## NonceR5 e ledgerretido

Literalproposto futuro trilha-a-fixtures-20261109-r5. R1/R2/R3/R4 consumidosreconhecidos somentehistórico, R5únicoexecutável apósBUILDintegrado. Mantertrêsoperaçõesconfirmadas(R1duas+R3ativação), máximoglobais24 e21novas; negar registrar_versao_fonte_v107/aprovar_versao_fonte_v107/salvar_fonte_normativa_v107 mesmo comnovaUUID. R4préAuthnão consomeintenção denegócio, mas consomenonce/identidadederequest; não reporbudgetnemreativarfonte.

LedgerR4minimizado deve provar upstreamfailure/download e ambosjobsprivadosSKIPPED/attempt1/HEAD/nonce, preservarledgersR1/R2/R3ehashesoriginais. Anteslogin/broker validarorigem/histórico; count3/remaining21derivados explicitamente. Nãoexigirreportprivadoinexistente ouinventarreceipt/logoutR4. Sehistóricoadulterado/ausente/ambíguo, bloquear.

## RED→GREEN e aceite

DepoisPLANintegrado, GATEseparadofecha metadatahashes/paths/steps/nonceledger e testes. SóapósGATEintegrado:
- REDcausal reproduz504debootstrap atualsemAuth e mesmoBunalvo; provarfalhaorigemsematribuircódigo.
- Helpers têm testesfixtureHTTP/archives:URL/versão/OS/CPU/redirectstatus/tamanho/hash/SRIerrados,truncado,symlink/traversal/extras/versãomentira,canáriosnãologados,semexecantesverificar. Positivo usa pacoteoficial verificado; nenhumtesteespelha sóstringsdeimplementação.
- ProvaLinuxx64CI executa Bun1.4.4einstallfrozenlock/build/testes pelos mesmoscomandos, não mocksódeversão. Preservar native15factuais/factory/8causais+suplementos e originalSDK/política.
- NonceR4spent/R5only/ledger3+21/deny3/replay/ancestry/attempt2negados, backendfreshnesssemrelaxamento.
- CIexatoZero/LOCK/protocolos/native, revisãoindependentesemCritical/Important e mergeprotegido. FalhaBun504histórica mantida, nãoreruncegoAuth.

## Execução posterior e continuidade

PLANCIreviewmerge→GATEmetadatahashes→RED/BUILD/GREEN/CIreviewmerge→PRrequestR5separado1JSON/7chaves comparentvivo/nonce/CI/revisão/ancestry→únicaexecução mainestável. RevalidarprodutoHML437/deployment/SSR110separadoharness; nãoexigirfrontendSha==harnessSha,nãoredeploysóhelperCI.

Registrar checkpointR4terminal+R5next pelo rito coordenado;DRAFT432/AUDIT_BINDING_PENDING não liberados. Preservar184originais/96+8+56+24Run124histórico,18públicos e72/V1não certificados. BackendC e seusexperimentosindependentes nãoautorizamAuthA. NenhumaAuth/R4rerun/mainmerge/deploy por estePLAN.

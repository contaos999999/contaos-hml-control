# GATE aditivo R4: readback causal e ledger de três operações confirmadas

Somente documentação. Preserva GATE373/405/434 e BUILD437, controles source-real/logout/factory/native8. Não executar Auth, rerunR3 ou qualquer mutação por estePR. DRAFT432 continua sem binding/auditliberado.

## Resultado terminal e prova

R3run42559214436/artifact13648722477: FAIL FLOW_ACTIVE_NOT_READBACK, últimoSOURCE_RECONCILE; recoverytrue, bindingsnull, logouttrue e cleanupFailure=null. Manifest4/4 conferido pelo coordenador. ZIPsha25644cd6eec0dcec9cf5ceaa2283d8a07b04cf64e8c1391ad2c6a5aaed32104c560; reportsha256e1d0cabcd5aeec18a695627c5b06ef49e36dba262117390e1fddb8ec04555931; receiptssha25628c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364.

Uma nova operação salvar_fonte_normativa_v107 confirmada (dois registros sealed+confirmed, NÃO duas operações), requestId309caf6c-5551-4e2b-ae33-4607a95ea025, payloadSHA256c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34. Preservar origem/contexto/identidade e artefato original, sem payload/responsebruto. R1duas+R3uma=trêsconfirmadas. R2semnovas deriva de receiptsvazios+brokersealantesPOST+sourcepath, não de campo intentCount inexistente. Falha posterior não desfaz a ativação confirmada.

Fonte atual prepare-visual-fixtures.mjs blob2772888765f7b1b44ba2edf8f15c842eb5fd09a8: após confirmAfter validar retorno fonteativa/versão+1, executa io.fresh();sourceRow() lê observer sem ordinal novo e exige ativa. Essa sequência é ponto causal a reproduzir; staleobserver/cache/ordem de resposta são hipóteses até REDcontrolado. Não alegar quebackendnãoativou, nem corrigir por repetirSalvar.

## Ledger e nonce fechados

Novo nonce literal futuro trilha-a-fixtures-20261109-r4. R1/R2/R3 reconhecidos somente como históricos consumidos, nunca executáveis. LedgerR1 original, ledgerR2 mínimo derivado e ledgerR3 mínimo revisado permanecem distintos e imutáveis. Validar ledgerR3 explícito antes do login e novamente na criação do broker; não satisfazer recuperação apenas com ledgerR1 atual. Inicializar brokercount=3, reportar confirmedBefore=3/maxNew=21 como estado do broker derivado dos ledgersvalidados, não como campo inventado nos reports históricos. Validar schema/identidade/run/membros/hashes e exatamente um parsealed+confirmedR3 acima, sem uncertain/extra/contradição; não criar campos reportficcionais ou inferir resultado por bindingsnull.

R4reconcilia fonte/versão/listas/competências por leituras oficiais existentes antes broker. Não inferir valor exato de versao_registro ausente dos reports; obtê-lo somente por leitura ordinária existente e coerente. Confirmar fonte jáativa e versãoR1aprovada no contexto único; ausência/múltipla/divergente/stale/inautorizada bloqueia. Estadoativa confirmado não habilita nova ativação. Negar registrar_versao_fonte_v107, aprovar_versao_fonte_v107 e salvar_fonte_normativa_v107 neste contexto, mesmocomnovoUUID/payloadequivalente. Nenhuma compensação/desativação.

Teto global24, trêsconfirmadas debitadas, máximo21novas emR4. R2zero não repõe saldo. NovorequestR4 sóapósGATE+BUILDintegrados/CI/review e PR1JSON comparent/nonce/HEAD exatos; não editarrequestconsumido nemrerunR3. Intençãoincerta congela broker/replay, preservando recibos.

## Readback pós-gravação: limite da correção

Somente observer/consumidor de leituras oficiais jáautorizadas e acionadas pelaUI/SDK. Capturar ordinal antes ação causal; distinguir requestiniciadode responseconcluída, filtrar query/contexto/chaves exatas e provar resposta correspondente posterior. Não aceitar cacheprécomando ou resposta atrasada iniciadaantesbarreira, ainda quechegueporúltimo. Correlacionar valor/versão esperados com IDs/relações oficiais. Resposta comando confirmada e readback são provas distintas.

Usarespera bounded jáexistente/fencedrain/açãoUIdeatualização jáprevista quando necessária; não aumentar timeouts/retries, introduzirpollingrede/RPC/query/SQL/fetch paralelo, remover freshness, afrouxar select/contexto ou forçarUI. SeUI não emite leituraautorizada necessária, bloquear e proporGATEespecífico antes novaobservação, não contornar viaadmin.

Auditar TODOS os readbacks restantes do preparador contra dadoantigo: fonte/versão/texto/capacidade/ativação, listas/item/versão/publicação/situação, competência/snapshot/requisito/documento/arquivo, análise/execução/resultado/revisão, parecer/aprovação/apresentação/pacote/protocolo e logout. Para cada um registrar (no teste) eventoUI causal, ordinalrequest, chavequery/contexto, responsecompletion, valor/versão esperados e estadofallclosed. Não corrigir genericamente cache por aceitarmaisdados ou ordenar peloúltimorecebido semproveniência.

## TDD e allowlist posterior

ApósGATECI/review/merge, só:
- scripts/hml/prepare-visual-fixtures.mjs e scripts/hml/prepare-visual-fixtures.test.mjs;
- scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs, apenas nonceR4/spenthistory/request e ligação factual do suplemento jáexistente, semalterarfence/factory.

Nenhum workflow/SRC/public/tipos/deps/lock/backend/SQL/Authconfig/ambiente/secret/PROD. Pode manterledger mínimo constante nos4mjs, semnovohelperfile; docsrecibosmínimos somentecomcamposreais e revisão.

REDobserverreal: snapshotrascunhoantescomando; comando retornaativaversão+1 e épersistidoconfirmed; readback antigo induz FLOW_ACTIVE_NOT_READBACK semmutaçãoadicional. Controlar requests/respostasforaordem, in-flightantesordinal, querydiferente, IDorg/contratotrocado, respostaerrostale e UIcache semrequestnovo. GREENaceita apenas observação causal autorizada atual, ou bloqueiacomcodigofechado semretry/escrita. Provar todosreadbacks auditados comnegativostale epositivoscontextuais.

RED/GREENledger: trêsdebitadas/21restantes, trêsRPCsproibidasnovachave, R1R2R3runtimebloqueados/históricoválido, R4únicoapósintegração, missing/extra/uncertain/hashes/rolesforjadosbloqueados. Preservarprimário/cleanupseparados e logoutR3GREEN/sourceformsR3; canáriosPII/URL/token/stackausentes. SuplementoChromiumfactualjáintegrado continuaexecutadonoCI e contado sóapósPASS; native8+visual1+SYS04/V112/V123 e factoryinalterados. Tests/lint/fmt/Zero/LOCK/protocolos/review noHEADfinal, semAuthduranteBUILD.

## Continuidade e saída

R3falha encerrada comlogoutverdadeiro; nãonegar suaativação bem-sucedida. Últimaconclusão: trêsoperações reaisconfirmadas+falhapósativação; nenhumalistacompetênciapacotofinalcomprovadoporbindings. Próximo:GATE→REDcausal→BUILD→CI/native/review/merge→requestR4separado→execuçãoúnica→recibos/bindingsreais→DRAFT432. R4 não autorizado por estecheckpoint.184originais,18públicos/Run78/114/124,72NAO_VERIFICADO_GLOBAL eV1NO-GO preservados.

# GATE R16: resposta void204 no observador, sem Auth

PLAN522 HEADc852acf55c8fb86a7f1ca0daa853fc6db5a9d731 integradof8acc6dbff3746c7f6d5540e1ee25beb316c4d0d,CI42706893342/42706893455SUCCESS,revisão5833391051/0C/I registra GATEvoid2mjs e GATErecovery4mjs obrigatórios. Este GATE deve terCI/revisão/merge antes do BUILD consumidor. PropostaRED524/523f9fd73e56ea824dfbd96b3626c25e4c43dedc é preservada como ancestral, sem reescrever história; testes deverão ser reconciliados sob esteGATE antesGREEN.

## Evidência e escopo

Inspeção originalR15 42705850329/job129462302474 validou artifact13713326447/22442B/ZIP49a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262. FalhaobservadaOBSERVATION_FAILED/RPC:aprovar_parecer_interno/RESPONSE_PROJECTION/statusHTTPNONE/requestFailureNONE; não há status/corpoR15 bruto nem se afirmará que204 foi observado. Typesblobimutável8ea7750b75fd9d76b29c36ce7613392e3ab65e19/clientePromisevoid e contratoPostgRESTprimárioPR2058/merge52d628f1ed1393daeab401cc0cbe9b8c973c91a5 fundamentam o caso legítimo204semcorpo que o consumidor atual rejeita por JSON.parse.

Somente scripts/hml/prepare-visual-fixtures.mjs e scripts/hml/prepare-visual-fixtures.test.mjs. Nenhuma alteração no auditor/controller/readers/YAML/SRC/public/types/deps/ENV/secrets/SQL/RPC/RLS/Auth/Storage/deployment/PROD. Não adicionar novo dado ou publicar corpo/statusbruto. Preservar sourceUI507 e todos deadlines/ordinal/fence/broker/reauth/readback/budget.

## Regra fechada no consumidor real

No listenerresponse existente, preservando origemAPIexata/URLsemqueryuserinfohash/endpointreconhecido/ordinal/status2xx/bodylimit1MiB/zerobytesfinally, admitir204 somentequando:
- rpc é literalmente aprovar_parecer_interno;
- request.method éPOST e request já está associado emmutationRequests à mutação validada, payload exato e requestoriginal;
- Buffercorpo tem comprimento exatamentezero.

Normalizarackinternoparanull e registraradmitted/responseOrdinal no mesmo caminho posterior atual. Não resolver ticket/broker, não criar receiptconfirmed nem presumir aprovação porACK. Status204 com corpo não-vazio, RPCdistinto/tabela/GET/mutaçãoausente ou nãoassociada deve falhar fechado OBSERVATION_RESPONSE/OBSERVATION_FAILED, sem fallback de JSON. 200vazio continua falhando;200JSON e demais2xx mantêm projeção/validaçãoatuais. 3xx/4xx/5xx não leemcorpo;bodyrejection/limite continuam falhando e bufferobtido é zerado emfinally.

Aprovação segue dependendo de readbackoficial posterior aoresponseOrdinal: tabela pareceres_internos,mesmoparecer/competência/org/contrato,statusaprovado eaprovado_em,confirmAfter/fenceativos. Acknull semreadback, readbackanterior/emvoo/estrangeiro/outroID/nãoaprovado/semdata nunca libera resultado,continuaPHASE_TIMEOUT/OBSERVATION_FAILED e intençãoincerta. Nenhumaautorização para reenviaraprovaçãoR15; esta mudança é offline atéGATErecuperação.

## RED/GREEN e provas

1. Reconciliar propostaRED524 pelo histórico sob base desteGATE. Executar consumidorcreateOfficialObserverreal, nãofunçãoespelho/syntaxerror/importausente. REDcausal para204vazioexato atualmente rejeitado e204não-vazioexato indevidamenteadmitido.
2. Positivocom204+mutaçãoassociada:flush semfirstFailure, bufferzeroizado;somenteleituraposteriorcontextualaprovadacomtimestamp permite observer.read correspondente. Teste deve observar efeito real, não só contante/mensagem. Fixturestécnicas não são respostaR15original.
3. Negativosfocais:204vaziosemassociação;204nãovaziocomassociação;200vazio;outroRPC204vazioeJSON;tabela/GET204vazioeJSON;HTTP403/500/bodyreject/malformedJSON;ACKsemreadback;readbackstale/emvoo/tenant/competência/id/estado/timestampdivergente. Canário em body/erro não publicado e bytes zerados também em falha.
4. Implementar somentebranch mínimo deparsing204. Não relaxar readbackTargets/mutationConfirmed/opinionObservation/sealRecoveryOpinion/broker/publicação/erroglobal. PreserveR11/R13recovery,10confirmadas+1reservadaanterior doCódigo e1incertaR15documentada;nenhuma novaAuthépermitida com orçamentoantigo.
5. GREENNodefocal/suite/lintfmt/CI aplicáveis/Zero/LOCK noHEADfinal,18nativos reais jáexistentes eprobe110módulos1476785bytes0024/8FQ,sourceOrdering/preflightDrain;revisãoindependente0C/I. Merge normal esperadoHEAD,semforcerebase/squash. NenhumrerunR15,dispatch,senha,nonce oudeploy para testar este fix.

## Continuidade vinculante

RecuperaçãoR15 emGATEpróprio antes denovaAppAuth:Doc12canônico6244bytes/report+receipts+observaçãooriginais,10confirmadas+2reservadas/max12novas/teto24,denysemânticoR11solicitaropiniãoOct eR15aprovaropiniãoOct mesmo comUUIDnovo,writer24dados+SHA25/HISTORY21,nonceR16separadoapósgates. Não implementar esses4mjs nesteBUILD2mjs nem suprimirpreflight.

Manter AUDIT_BINDING_PENDING,V117/V119/V120/8IDs64casos pendentes atéprova real;não recapturar19inventariadas,não repetirAPI42596392357/art13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795,não certificar27/V1 por CI/mock. Checkpointbackend138 a cada execução.

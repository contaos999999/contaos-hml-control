# PLAN R16: recuperação R15 e resposta void do parecer

Escopo P0 de continuidade Trilha C/V1, sem certificação antecipada. Documento prévio; GATE separado com literais/schemas/tests antes de BUILD. Não autoriza request, Auth, SQL, deploy, rerun ou mudança de segurança.

## Evidência e hipótese limitada

R15 originalSdd895a5c30acbb39c821153d86477985ae94b939, upstream42703248266SUCCESS,Fixtures42703523206FAILURE,Audit42703523239SUCCESS/privateSKIP. Inspeção protegida42705850329/job129462302474/HEADd472c03428dfa14ef889e9f367cd2214b3d9798fSUCCESS validou artifact13713326447/22442B/ZIP49a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262 e22dados/SHA23/HISTORY19.

Report3364bytes/SHA038d291631f6d0badc89c014cbfbb137557a780039fb16b8d5c1fc9e53dee3c6;receipts1299bytes/SHA3652e7766ef218067642137effb805d448c72f86da3c402a583b5fcf7aa29007;observation423bytes/SHAfc97c8e25c55840331737b307680f9846b11f0b2e455a04154230a99b455a614. ReportfailureOBSERVATION_FAILED/FINAL_READBACK;diagnosticsRUNTIME_FRESH,pathCOMPETENCIES/COMPETENCY_UI/COMPETENCY_COMMAND/RUNTIME_FRESH/UI_CONFIRM_FENCE/RUNTIME_FRESH. Logoutattempted/verifiedtrue,cleanupnull,completedfalse.

firstFailure=RPC:aprovar_parecer_interno/RESPONSE_PROJECTION/statusHTTPNONE/requestFailureNONE. O log sanitizado NÃO preservou statusHTTP/corpo efetivos; não afirmar que a resposta R15 foi204. Código atual faz JSON.parse de todo corpo2xx e, portanto, rejeita204vazio legítimo. Contrato consumido: types.ts blobimutável8ea7750b75fd9d76b29c36ce7613392e3ab65e19 declara aprovar_parecer_interno Returnsundefined; src/lib/competencias/parecerInternoDados.ts decidirParecer éPromisevoid e verificaerror,semexigirdata. FonteprimáriaPostgREST/postgrest PR2058/merge52d628f1ed1393daeab401cc0cbe9b8c973c91a5 estabeleceVOIDRPC204semcorpo. Esta é uma lacuna concreta do observador e uma hipótese compatível com a falha R15, não reconstrução do corpo desconhecido.

## Recuperação, saldo e não repetição

Ledger originalcount12/priorConfirmed10/priorReserved1/newArmed1,frozen/pending/senttrue,maxNew13/teto24. Recibos sealed euncertain da MESMAaprovar_parecer_interno,request6e6b6afb-2216-42ef-bd89-571301e97e1f/payloadbc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3. Duaslinhas não são duasintenções. Resultado de negócio e nova confirmação permanecemUNKNOWN.

Próxima execução deve carregar DocR15 canônico obrigatório derivado somente dos três raworiginais e hashes acima, além de R13/R11 e todos anteriores. Exatamente12campos no padrão documento de recuperação já existente; GATE fechará bytes/hash/literais, validação own-data/ordem/proxy/getter/canonical e identidade/artifact/request. Validar antes broker/login/source/recovery/budget/bootstrap; nenhum Doc fabricado R14, que permanece zeroAuth por prova própria.

Conservar10confirmadas e contabilizar2reservadas(R11+R15), máximo12novas/teto24; não converter sealed/uncertain em confirmed, não reembolsar pelo fail/logoutsucesso. Impedir reaproveitar requestR15 e negar semanticamente aprovar_parecer_interno para o parecer de Outubro com mesmo contexto/fundamento mesmo sob UUIDnovo. Preservar denyR11 solicitar_parecer_internoOutubro. Na retomada, leitura oficial por UI/observer com fence pode confirmar estado jáaprovado e seguir sem reenviar. Se continuar nãoaprovado ou não houver prova causal suficiente, parar fechado e documentar; sem compensação automática.

Writer mantém22dados anteriores emordem e acrescentareceipts-r15.json/recovery-r15.json:24dados+SHA25/HISTORY21. HistóricoR13 eR11 byteexato, dívida de observação preservada. GATE fechará estados reserva/contagem e testes. R15consumido,noncefuturaexclusivatrilha-a-fixtures-20261109-r16,requestseparado sóapósBUILD/GREEN/revisão/merge/frescor/gates;nãoautoriza essepedidoagora.

## Correção mínima do consumidor void

Allowlist futura: scripts/hml/authenticated-visual-audit.mjs, scripts/hml/authenticated-visual-audit.test.mjs, scripts/hml/prepare-visual-fixtures.mjs, scripts/hml/prepare-visual-fixtures.test.mjs. Sem SRC/public/YAML/tipos/deps/RLS/RPC/Auth/Storage/config/deploy/PROD. Preparador continua separado eNodebuiltinsreader intocado.

Apenasaprovar_parecer_interno admite acknormalizado null para HTTP204 com corpo de comprimento exatamentezero. Nenhum fallback genérico paraJSONmalformado/corpovazio200/outroRPC/tabela/3xx/4xx/5xx. Nenhum conteúdo privado será publicado; bytes zerados emfinally também no caminho204/erro. Demais status2xx seguem exatamente validaçãoJSON/projeçãoatuais; não introduzir formatos legados200null/vazio sem contrato/prova específica.

Resposta204admitida prova apenas ACKsemdata. Aprovação ainda exige readbackoficial posterior ligado aomesmoparecer/competência/contexto e ordinal, statusaprovado+aprovado_em, confirmAfter e fence completos antes brokerconfirm. Acknull isolado, dado anterior, id/tenant/competência errado, statusnãoaprovado ou leitura ausente ficamuncertain/falham. Não ampliarURLs/POSTs/RPCs/listeners/grants ou contarlegítimo204como100%conforme.

RED causal no observador real antes do fix: eventoresponse204+Bufferzero desteRPC é recusadohoje; aprèsfix admiteACK mas sócomreadbackcontextual posterior confirma. Negativos204combytes,200vazio,HTTPnão2xx,nonvoid204,malformedJSON,bodyreject,PIIcanário,observaçãotardia/foraordem/outrocontexto e zeroizaçãodebytes. Testar recuperaçãoR15 obrigatória/hostil/hash/reserva12/10+2+12/writer24+SHA25/HISTORY21/denysemânticoR11eR15/nenhumreplay. Não inventar sucessoR15 nasfixturesunitárias.

## Gates e critério de término

PLAN CI/revisão/merge; GATE distinto fecha DocR15/literais/matrizes/escopo, CI/review/merge antesBUILD. TDD RED/GREEN focal/Node/lintfmt/Zero/LOCK noHEADfinal, preservar18nativos/probe110módulos1476785bytes0024/8FQ/clock/sourceOrdering/preflightDrain e revisão independente. Merge protegido normal semforcerebase/squash. UmrequestR16futuro JSON7campos terá CI2+reviewcanônica/merge/freeze/originaisattempt1terminais próprios. Não repetirR15/API; nenhuma operação será confirmada semreadback.

Após bindings reais V117/V119/V120 completos, novoGATEde auditoria restrita V111/V114/V115/V116/V117/V118/V119/V120=64casos(4larguras×2temas),capturas+SHA256+logs/resultadosindividuais. Não remover AUDIT_BINDING_PENDING por conveniência nemrecapturar19inventariadas. ProvaAPI42596392357/art13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795preservada. V1/27telas não certificadas enquanto faltar prova.

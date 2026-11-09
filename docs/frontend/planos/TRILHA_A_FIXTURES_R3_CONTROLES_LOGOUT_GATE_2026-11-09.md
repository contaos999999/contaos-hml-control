# GATE aditivo R3: controles reais e encerramento após R2 sem novas intenções

Somente documental. R2 terminou; não rerun, nova Auth ou BUILD por este PR. Preserva GATE373 e retomada405, DRAFT432 ainda pendente, fonte/SRC/tipos/transportes/dados intactos.

## Evidência e causalidade delimitada

Run42553093050, artifact13645999071, ZIPsha256 c6b33596bd1454388d0989506c74ccbaece749d0c4bcf0b45fbdb0f692927475; reportsha256 d986f375e1cba68be5f78b61544d241ef5f4c71f126611112c960226a939e805; receiptssha256 fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf. Recibo público do coordenador issue317 comentário6731148616. Native8 real do R2 PASS; não há novo bloqueio de segurança atribuído a esse run, e esta correção não altera a cerca. Conferência dos artefatos pelo coordenador: zero novos recibos, derivedIntentCount0 (derivação técnica, não campo do report), reconciliaçãoR1true; bindingsnull. TIMEOUT em SOURCE_FORM_FIELD, último concluído SOURCE_UI_CONTROL. logoutfalse/LOGOUT_FAILED. Não confundir zero novas intençõesR2 com zero mutações históricas: R1 confirmou duas.

FonteUI real do R2:437c788e32f0325dd15c9d2e7277c10129bcb462. GET confirmou que BaseNormativaContrato.tsx mantém o mesmo blob já observado em866608620909bf313a6c2192736330222f9219ad (fonteR1histórica), blobe68fc6352f4bf52f5a6c9c205d327f509c608ca4: DialogoFonte contém label envolvendo texto Situação, select e span 'Mudança de situação exige administrador; ativação exige versão aprovada.'. Preparadorfield(s,name)=getByLabel(name,{exact:true}) chama field(dialogoEditar,"Situação").selectOption("ativa"). Esse contraste de accessible name é hipótese causal fortemente localizada pelo report; Reprodução independente review_plan confirmou em Chromium real: getByLabel('Situação',{exact:true}) count0 e combobox com nome completo count1; registrar seu recibo/HEAD da prova no BUILD. TDD deve preservar esse RED sobre o source-real, sem chamar o teste local de execuçãoHML. Não atribuir erro ao backend, Auth, fence ou capacidade sem prova.

Logout atual tenta Sair diretamente; dialogo modal aberto pode impedir clique. Provar o bloqueio causal no runtime real e teste fonte-real antes de fix. Não declarar que LOGOUT_FAILED foi definitivamente causado pelo modal só pelo código. Não capturar respostasAuth, textos privados ou errosbrutos para investigar.

## Nonces e retomada

Novo nonce literal futuro: trilha-a-fixtures-20261109-r3. R1 trilha-a-fixtures-20261108-r1 e R2 trilha-a-fixtures-20261109-r2 passam a histórico consumido, nunca executáveis. Parserhistórico reconhece apenas esse conjunto fechado; operação fixtures aceita somenteR3 após BUILD integrado. Não escolher maisrecente nem aceitar noncearbitrário.

LedgerR2durável: preservar o artefatooriginal e materializar documento mínimo fechado com run/artifact/request/nonce/HEADs, os três hashes acima e recibo vazio de SHA256fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf. Validar schema/membros/hashes e receipts=[]; validar o report original exato, que NÃO contém intentCount, sem exigir ou adicionar campo inexistente. Zero novas operações de negócio é derivado de receipts=[], invariante brokerseal persistido antes de qualquer POST e sourceflow interrompido antes de SOURCE_ACTIVATE_COMMAND. Documento mínimo registra derivedIntentCount=0 e proof=receipts+brokerInvariant+sourcePath; não representa contagem reportada nem inferência por ausência de bindings. Não copiar dadosPII/errosbrutos. Documento mínimo pode ser constante versionada nos4mjs, sem novo arquivo de código; manter vínculo explícito ao artefato original para conferência. R1 e R2 são ledgers distintos, não substituir um pelo outro.

R3reconcilia antes de negócio a mesma versãoR1 aprovada já comprovada e mantém ledgerR1 imutável; R2zero não dispensa reconciliação atual. registrar_versao_fonte_v107 e aprovar_versao_fonte_v107 seguem proibidas para este contexto, mesmocomUUIDnovo. Fonte/listas/competências duplicadas ou divergentes bloqueiam. Teto global24 intenções com duasR1 jáconfirmadas; máximo22novasR3. Não aumentar peloR2terzero nem reiniciar orçamento apósfalha. Resultado incerto congela broker, semretry/replay.

NenhumrequestR3 criado por esteGATE. ApósBUILD/CI/review/merge, request posterior1JSON(schema1/setechaves), nonceR3/parent atual/HEAD exatos, revisão canônica/CI/ancestralidade/uniqueness, mainestável. Não editarJSON428/R2 para torná-loR3. Auditor mantém AUDIT_BINDING_PENDING.

## Ajuste mínimo de controles, sem alteraçãoUI

Corrigir somente o seletor do executor para o select Situação com nomeacessível real e contexto únicoDialogoFonte. Permitir associação estrutural fonte-real label→select ou getByRole("combobox",{name:literal completo comprovado,exact:true}), com unicidade e tipo/role esperado. Não regexprefixo/global, nth/fallbackporordem, forcedclick, DOMinjection ou alteração de labelsSRC para acomodar teste. Campos técnicos/helpertext do frontend versionado são fonte, não autorização para capturar texto arbitrárioHML.

AntesBUILDinventariar TODOS os controles restantes dos fluxos fonte/lista/competência/documento/análise/revisão/parecer/aprovação/registro que o preparador realmente aciona; casar cada seletor atual com label/name/role e escopo reais. Testes devem exercitar os componentes ou fragmentos extraídos doSRC, sem reescrever artificialmente label para caber no seletor. Cobrir labels comhelpertext, obrigatório/opcional, nomes duplicados emregiõesdiferentes, selects/radios, botões/dialogs, paginação e Close/Cancelar/Escape. Se outro mismatch reproduzir, ajuste mínimo seletor nesse mesmo escopo fechado, comREDpróprio; sem alterar fluxos/payloads/capacidades.

Leia ordinaryUI existente apenas; não acrescentar RPC/query/endpoint/SQL/observação nova. A presença de receipt ou allowed_actions não amplia rede.

## Encerramento seguro e diagnóstico preservado

No finally, limpar referênciasJWT/apikey semlogs e manter retirada de observadores/pending/fence conforme contratos atuais. Se houver overlay conhecido do fluxo real aberto, dispensá-lo por açãoUI de cancelamento/fechamento comprovadamente NÃO mutante, comescopo e identidade únicos; depois exigir ausência do overlay e acionar Sair normal. Não clicar Salvar/Confirmar/Aprovar/Registrar, não aceitar dialog nativo indiscriminadamente e não forçar acesso ao botão encoberto. Overlaydesconhecido ou fechamentofalho permanece cleanupfailure; tentar logout normal somente quando seguro, semretrycego.

Provar sessão encerrada pelo contrato normaljáexistente (/login +fence), sem capturar responseAuth/refreshToken/storage/cookies. Falha primáriaTIMEOUT conserva phase/subphase/lastCompletedStep e enum; errodecancelamento/logout separado não a sobrescreve. Conservar report/receipts/SHA256SUMS inclusivefalha e partial, sem lançar artefatos como concluídos. Nenhuma troca de timeout para esconder labelerrado.

## Allowlist futura e TDD obrigatório

Somente após integração desteGATE:
1. scripts/hml/prepare-visual-fixtures.mjs
2. scripts/hml/prepare-visual-fixtures.test.mjs
3. scripts/hml/authenticated-visual-audit.mjs — nonceR3/consumedhistory e barreiras de request, mais ligação factual de suplemento Chromium sourceforms/logout do preparador no nativeGuard já invocado pelos protocolosCI atuais; não alterar factory/fence. Executar suplemento em subprocesso separado com ambiente reduzido/timeout/saída fechada e provar TAP completo/zeroSKIP/zeroFAIL; só emitir contagem factual depois de executar. Não contar suplemento como um dos8causais ou visual1, nem ampliar rede/Auth. Se falhar, abortar. Nenhuma mudança deworkflow.
4. scripts/hml/authenticated-visual-audit.test.mjs — negativos correspondentes.

Não alterar workflows,SRC/public,tipos,dependencies/lock,backend/Auth/Supabase,ambientes/secrets/PROD. SuítesDOM/Chromium usam dependências existentes; nenhumHML duranteBUILD. Preserve todoscontratos425/426factorynative8+visual1+suplementos, postData/CSP/proxy/TLS/sandbox1208, provenance110/SSR/freshness/metadata, parAUTO_DISCOVER, concurrency/RQ01RQ02, intentsealbeforePOST e políticasdenydefault.

RED: componente/markup real deEditarFonte e seletor antigo exato não resolveSituação; modalaberto torna Sairinacessível; erroTIMEOUTprimário permanece mesmocomlogoutfalho. GREEN: seletoruniquereal altera SOMENTE selectlocal no teste; modalconhecido cancela sem comando, Sairencerra pelo contratocausal; todoscontrolesrestantes possuem source-realpositive e escopo/duplicado/unknownnegative. Injetar falha emawaitdeform/cancel/logout; canáriosPII/URL/token/stack ausentes.

NonceRED/GREEN: R2 eR1 runtimebloqueados; históricoambosreconhecido apenas como spent; R3 únicoexecutável após integração; nonceextra/duplicado/replay/ancestryfalsa bloqueados. Provar reconciliação semduasRPCsR1,22maxglobal,0novaintençãoantesrecovery, ledgerR1+R2retidos e falhasprimáriacleanupseparadas.

NoHEADfinal: testesunitários/reaisChromiumsourceforms, lint/formato, Zero/LOCK, protocolosnativos e revisãoindependente semCritical/Important. Nãorerruncego deCI e nãocompensa fixture paraobterPASS.

## Próxima etapa

CI/review/mergeGATE → RED/BUILD4mjs → CI/native/review/merge → novoPRrequestR3 → execuçãoúnica → conferirartefatos/recibos/bindings/logout → preencherDRAFT432. PreservarR1/R2semreplay,18públicos,Run78/114/124,184pendentes,72NAO_VERIFICADO_GLOBAL,V1NO-GO. Estaemenda nãoaprova24casos nemhomologaproduto.

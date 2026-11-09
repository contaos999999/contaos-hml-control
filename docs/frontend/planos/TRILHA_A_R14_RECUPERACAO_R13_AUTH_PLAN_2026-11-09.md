# PLAN R14: recuperação R13 e nova autorização após a prontidão UI

Issue #317, prioridade0. Base documental dc5f1c6a958604903ffc8c348daed92f32679890; checkpoint6749916398 e coordenação6749976122. Este PLAN somente documental requer CI/revisão/merge e não libera código, Auth, SQL, deploy ou request. GATE separado só poderá avançar após o BUILD UI503/504 ter RED/GREEN real, CI/revisão e merge protegido com HEAD/commit efetivos registrados.

## Escopo separado do conserto UI

PR503 documental já integrada em dc5f1c6a958604903ffc8c348daed92f32679890 trata a prontidão do listSelectionControl, com BUILD UI próprio em PR504. Não duplicar sua implementação, alterar helpers/timeout3000ms aprovados ali ou assumir que o RED pendente já comprovou uma corridaReact. Observado R13: FLOW_LIST_UI_MISSING depois LIST_GET; mecanismo assíncrono é hipótese a resolver pelo ensaio source-real daquele trabalho.

Este PLAN trata APENAS da recuperação/autoridade após R13: documento canônico obrigatório, orçamento preservado, nonceR14 e cadeia de proveniência. Futuro BUILD limitado aos quatro mjs existentes:
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs

Preservar por merge normal os dois mjs do UI BUILD efetivamente integrado, seus casos reais e18nativas/TAP5/base8. GATE R14 deverá fixar seu HEAD/merge GREEN real; a existência da PR504 ou de teste helper isolado não satisfaz essa dependência. Nenhuma mudança SRC/UI de produto, YAML, transporte/listener, GET/RPC novo, retry/timeout, segurança/fence/fábrica, schema/types/deps/lock ou regra de negócio neste escopo. C13, PR499 documental e todas as frentes históricas permanecem.

## Evidência R13 original

Run42685547737/attempt1/headf39e32ca1009b23aaae19dcbd01e282df2bf0847 FAILURE/private129391860451, upstream42685263821 SUCCESS e oposto42685547969 SUCCESS/private129391505253SKIPPED. Artifact13704636643/name trilha-a-fixtures-42685547737-1/19861B/ZIP SHA2567d097d83d5b622d4277be39d2155800223e18fccfe9258ba1adabf337c1e5307. Hashes20dados/upload passaram. A inspeção original42687417968/job129397852446 SUCCESS publicou exatamente uma prova;20/20hashes e bytes foram conferidos independentemente, sem novoZIP/Auth.

Raw report1891/SHA877dca165c4d46a61b8f5ea1946a6a223ceb17e9b64b9ef4067d8e24d5b7aa81: FLOW_LIST_UI_MISSING/PROTOCOL/Error, phaseSOURCE_AND_LIST, subphaseLIST_UI_CONTROL, pathSOURCE_AND_LIST/LIST_UI_CONTROL/LIST_UI_CONTROL, lastCompletedLIST_GET. completedfalse, logouttrue/cleanupnull, bindingsnull/ids[]. Ledger9count11/priorConfirmed10/priorReserved1/newArmed0/maxNew13/flagsfalse. Receipts55/SHAfc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf: array vazio. Observation280/SHAf6f4ea8b51e4ec9ab3e8aca8e4fb6c3367d808174e884ca4c6119d6a06c33aeb: firstFailure=null não certifica sucesso.

Reconciledtrue/sourceVersion1ebbfd0b-c50c-405d-8806-321f18e179e0/sourceHashd8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1 são observações históricas, não licença para pular reconciliação atual nem prova de ausência de dados. Houve sessão com logout verificado; não classificar R13 como zeroAuth. O conjunto fechado comprova zero novas intenções armadas/confirmadas neste run, sem inferir causaReact, nova reserva ou promoção do R11UNCERTAIN.

## Documento R13 obrigatório

Documento contaos.fixture.recovery-r13.v1, canonicalpretty2+LF, doze campos próprios ORDENADOS: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw. Documento canônico reconstruído dos três raws originais, conferido independentemente por Root e revisor:3108ASCII/SHA25692bf8114d857b2061b0a2ce67cfb908f2dd1c71e1800b567bfecf52c17e12da9. Fonte durável da prova: inspeção42687417968/job129397852446 e seus20membros/hashes; GATE fixará o literal/blob canônico revisado antes do BUILD.

Pins: workflowRun42685547737/artifactId13704636643/requestIdtrilha-a-fixtures-20261109-r13/harnessShaf39e32ca1009b23aaae19dcbd01e282df2bf0847; ZIP e três hashes acima. Report/observation pretty2+LF; receipts vazio ORIGINALcompact+LF; não normalizar ou reconstruir raws históricos. Frontend0024b3c6739ab6296ec12338f11cf792d3a5f84b/deploymentdpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh têm papel distinto do harnessSHA.

Validar identidade/tipos/ordem/canonicalização/bytes/SHA/zeroarmado/logouttrue e cadeia histórica antes login/armamento, em todos os consumidores de recuperação/budget/broker/reconciliação e bootstrap real. Missing/crossproof/hash/raw/order/accessor/getter/símbolo/Proxy/revoked/protótipo hostil bloqueiam sem efeitos. Não tornar o novo documento opcional/default; mantêm-se também R11Doc6130/SHA29f674764a2c8f953f764fcb6a40d8c330e441b488dfcab56a6ee4f9f389c423 e todos os documentos anteriores obrigatórios.

## Orçamento e autoridade futura

Dez confirmadas+uma reservada/base11/teto24/até13novas continuam EXATOS. R13zeroarmado não aumenta confirmedBefore, priorReserved, saldo ou currentreceipts. Ledger corrente9ordered mantém priorConfirmed10/priorReserved1/newArmedCount=count-11/maxNew13; recovery10fields permanece confirmedBefore10/maxNew13. Flags reais do broker novo, sem recibo fake ou pending para história.

R11SEALED→UNCERTAIN é reservado/gasto permanentemente, não promovido ou reembolsado por GET. Preservar usedIdaf968191-7d60-4adb-9c60-ebd5f0741e8e, negação semântica de solicitar_parecer_internoOct com novos UUIDs/mesmo semlinha, dez negações anteriores, provaOct fresca selada antesANYarm e separação ACKjob/parecerID. R12zeroAuth10GET/4Gitblobs/cache9/context reset/fresh30s/loader0GET/tokenisolado permanecem intactos. Não fabricar artefato/report/receiptsR12.

R1–R13 gastos; nonce futuro trilha-a-fixtures-20261109-r14. Auditor mantém AUDIT_BINDING_PENDING. Nova ancestralidade GATE R14 integrado e dependência UI GREEN deverão ser verificáveis pelo contratoGit/request. Nenhum request/autorização antes dessas integrações.

## RED/GREEN e fases

1. Integrar este PLAN após CI/revisão. Publicar GATE R14 separado SOMENTE depois do UI BUILD real estar GREEN/revisado/integrado, fixando HEAD/merge e origem atual.
2. Após GATE CI/revisão/merge, publicar RED real da recuperação/nonce/ancestralidade; exercitar novo documento ausente/hostil/crossproof em todos os entrypoints e prefixo bootstrap real antes login/efeitos, além de positivo com orçamento10+1+13. Preservar o RED/GREEN source-real UI503 sem reimplementar o seletor.
3. BUILD4mjs acrescenta documentoR13/validador/callsites/broker/runtime/writer, nonceR14/spentR13 e testes fechados; não muda orçamento ou comportamento UI. Provar canonicalização ORIGINAL dos receipts vazios e não regressão do R11não vazio; dados/raws anteriores continuam byte-exatos.
4. CIHEADliteral aplicável: Node/protocolos/helper30/ESLint/Prettier/produto/TS/build/Zero/LOCK/TesteC, publicliveprobe e18nativas reais/base8/sourceforms5/TAP1..5/failcancelledskipped0/sourceOrdering/preflightDrain. Sem atestado transferido de HEAD anterior, mock de consumidor ou contagem inventada. Revisão independente/merge protegido.
5. RequestR14 separado SOMENTEJSON7campos/fixtures/nonceR14/pai real/blankpairAUTO_DISCOVER, doischecks/canônica pinned/freshness e merge normal. Congelar main/HML até upstream+dois subscribers originais attempt1 terminais, sem rerun/cancel/dispatch/Auth alternativo.
6. Writer futuro preserva20nomes atuais e append SOMENTE receipts-r13.json/recovery-r13.json, total22dados+SHA256SUMS=23membros/HISTORY19. Não adicionar R12fake nem reescrever R11ledger8/R13ledger9. Report15/diagnostics9/recovery10/observation6/4 e CAU2currentconfirmed excluindo reserva preservados.
7. Depois do terminal e artefato real, leitor estático2mjs em PR separado com pins reais22dados/HISTORY19 e enums de produtor efetivamente provados; políticasFD/digest/toolpin/captura/warnings/bounds/UNKNOWN/fatal consistency intactas. CI/review/merge antes inspeção originalpushmainread-only. Sem leitor antes de artefato ou ZIPmanual.

HMLperfil canônico observado0024/8FQ permanece referência, sem novo deploy/settings/terceira chamadaVercel autorizados. Revalidar main/backend vivo/alias/READY e bundle público pelos guards existentes antes das etapas dependentes; não afirmar freshness sem evidência primária atual. Este PLAN não encerra184/208/232/72/V1; preservar18públicos/Run124204PNG102DOM307hashes/25normativas/catalog100/97/types8ea e histórico integral.

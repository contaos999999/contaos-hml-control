# GATE R17: recuperação R16 e prontidão pré-aprovação

PLAN534 HEADf38faa7d3881a0576a0272a435eaf8f268904916 integrado em fb634da1d9970dda1b8f9e7d3c9929092e6643e1, revisão independente5834170513/0C/I, Zero42718000685/LOCK42718000662 SUCCESS. Exigir CI/revisão/merge deste GATE antes de BUILD. Sem autorização de Auth, nonce, rerun ou deploy por este documento.

## Alvo e documento original

Inspeção42716637333/job129499783558/HEAD5f2b4e29e1fefd57ca88878d61ada3370edf4024 validou R16run42713640896/S10cac45b655d5eece9881fdf83545887c371d548/art13717457216/ZIP25487/SHA39eb9b34bd2c3b58df9b28cb666e0911538b24763eeb744f75fd5675a91a7305. Não executar esse negócio novamente.

DocR16 é exatamente12 strings próprias de dados enumeráveis, nesta ordem:
schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw.

Valores: schema contaos.fixture.recovery-r16.v1; workflowRun42713640896; artifactId13717457216; requestIdtrilha-a-fixtures-20261109-r16; harnessSha10cac45b655d5eece9881fdf83545887c371d548; ZIP acima. Textos originais imutáveis:

| Raw | Bytes | SHA256 |
| --- | ---: | --- |
| reportRaw |3922|f93d7b7a5dd9ffc7a65a13a52b399be61830113528af1bc081ed5a83f37938b2|
| receiptsRaw |5032|3700fce7ae66a58fa7f3c9d1a30d11f10eda794d41c0a1ff2e4302ca9645e4b6|
| observationRaw |280|3a270be6970c5e46168c33d53b2ea245ab722cd954713e1f9dd9d312c796fcb8|

CanonicalJSON.stringify(doc,null,2)+LF:10749bytes/SHAf5427aa65d4ab75637df290b72b6a8c07a5a7ce30f1b2dc5a4328720133bdd86. O cálculo V8 foi conferido com cinco vetores e os três raw; teste com Nodecrypto deve confirmar exatamente esses bytes/hash na primeira rodada de testes, antes de GREEN. Divergência bloqueia, nunca atualizar hash para aceitar dados diferentes.

Validador exportado no auditor, importado pelo preparador, seguindo o modelo R15: ordem/chaves/own-data/protótipo/Proxy/getter/símbolos/extras, strings exatas, bytes e hashes, resultado congelado. DocR16 obrigatório antes de broker, runtime/login, preparo, reconciliações, budget, bootstrap e preflight/presecret. Preservar todos os documentos R1/R3/R4/R5/R6/R7/R8/R9/R10/R11/R13/R15 e provas R12/R14; não fabricar DocR14 ou tratar R16 como zeroAuth.

## Confirmações e orçamento

R16 original: completedfalse/failureCOMPETENCE_PRESENTATION_GATE nas duas competências, logouttrue/cleanupnull, firstFailure de observação null. Ledger original16=prior10+reserve2+new4, todos os4 novos confirmed; valores antigos permanecem no documento original. A próxima base é14confirmadas+2reservas=16, máximo8novas/teto24, sem promover nem reembolsar R11/R15.

| RPC confirmado R16 | UUID consumido | PayloadSHA256 |
| --- | --- | --- |
| criar_documento_competencia_v115 |d69325a4-78c8-4bf3-8831-cbef2fb38d95|bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d|
| solicitar_analise_competencia |368de7ea-0056-451a-b0da-30ee0e10ee62|0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765|
| solicitar_parecer_interno |57cde7b2-3ae8-4642-81fe-d45f4971a524|4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f|
| aprovar_parecer_interno |fb2af693-ede5-4d1a-99d3-408a2f7cb79e|0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395|

Adicionar os quatro UUIDs a usedIds e negar replay semântico dos quatro efeitos em Setembro, mesmo com UUID/fundamento/título equivalente alterados. Não depender apenas do hash ou de evidence do chamador. Preservar todas as negações R1/R5/R8/R11/R15.

Bindings históricos reais:
- Outubro: competência50c26274-a36f-48e0-b2fe-5a1caf5d6a49, requisito75938450-a972-410c-8612-da3ef7dc0e00, documentoc7f56ac9-81d6-45a4-81f8-db1383006c41, execução3c174678-a6ec-4415-9d25-6e8a859de2cb, parecer9ec80151-bbf6-4469-9cd8-7d96d1bb02cd.
- Setembro: competência79bdc139-ed10-4c91-905e-b32b9a824d27, requisitoc824a6f9-e519-44cc-8911-87d1009e2eaf, documentocd1624d3-73f7-4ea1-b317-c52627df6824, execução00da4236-810f-4a89-8be5-b2ffcd50a480, parecer7bbbe81e-e34c-44dc-a76f-ed85fd56d87f.

Reusar somente após leitura oficial UI/GET atual, contextual e completa dos IDs/relacionamentos. Ausência, mudança de documento/execução/parecer, estado stale ou substituído bloqueia antes de nova escrita; não criar de novo ou reanalisar para contornar. Ambos os pareceres precisam estar aprovados com timestamp válido antes de QUALQUER arm. Selar IDs/versões/hashes/estado em tokens opacos ligados ao broker e à identidade; rejeitar outro owner, token consumido/inválido, leitura em voo/anterior/estrangeira, versão/hash/status/data divergentes. Não confiar em evidence fornecida pelo chamador.

Atualizar snapshot/summary atuais coerentemente: priorConfirmed14,priorReserved2,newArmedCount=count-16,maxNewIntentions8,maxIntentions24. Contagem inicial16; só novo arm válido incrementa. Recibo histórico não vira nova confirmação. Demais persistSafe/frozen/pending/sent/deadlines/CAS/fence/tickets permanecem.

## Consumidor V119: pré e pós-condições distintas

FonteUI0024b3c, SDK parseVisaoGeral permite snapshot competencia.percentual_conformidade number|null, V119 usa allowed_actions.apresentar e situação; aprovarApresentacao valida id_aprovacaoUUID/situaçãopode_apresentar_contratante/percentual100 na resposta RPC. O preparador recusava antes de aprovar o DTO legítimo com snapshotnull/0 e portão canônico100. Não afirmar que esse foi o valor real do R16, pois não foi publicado.

Pré-aprovação exige, no overview oficial do contexto correto: blocking_summary.analise_concluida_atualtrue,parecer_aprovadotrue,portao.liberadotrue,portao.percentual===100 numérico e allowed_actions.apresentartrue. Snapshot anteriornull/0 não concede conformidade; não usá-lo para bloquear essa etapa quando o portão oficial satisfaz100. Nenhuma tolerância a99.99 ou string100 no percentual CANÔNICO, NaN/Infinity, portãofalse,capacidadefalse ou identidade errada. O snapshot anterior permanece tipado numberfinito entre0 e100 ou null, incluindo23.5; apenas não se exige100 nessa etapa. Getter, Proxy, ausência ou tipo textual não se tornam DTO válido.

Após comando, exigir ACK válido com id_aprovacaoUUID,situaçãopode_apresentar_contratante epercentual_conformidade100, como o adapter; apenas ACK não confirma. Preservar ou tornar explícito o readback posterior ao responseOrdinal: mesma competência/org/contrato, situação pode_apresentar_contratante, aprovação atualtrue, portão canônico100 e snapshotpercentual100, contexto/fence seguros. Aplicar também ao estado já aprovado antes de gerar binding elegível ou registrar. Não retirar snapshot100 do pós ao separá-lo do pré. Resposta inválida, dado anterior/emvoo/foreign, falta de confirmação ou timeout permanecem incertos/negados.

Se registrar, somente Setembro e somente após pós-condições acima; protocolo/pacote/hash/itens reais por readback existente. Não inventar apresentação ou preencher binding por rota/UUID presumido.

Após confirmação da aprovação e antes de produzir binding V119 ou registrar, exigir allowed_actions.apresentar===true de NOVO readback oficial contextual, com ordinal/fence/freshness. Revalidar imediatamente antes do registro pela UI/SDK já permitida, sem endpoint novo. Se a permissão tiver sido revogada, impedir qualquer novo arm/clique/registro e binding elegível. Uma aprovação já comprovada por ACK válido e estado/readback posterior corretos mantém seu recibo confirmed; revogação posterior bloqueia a ação seguinte, sem criar incerteza fictícia. Testar aprovação confirmada seguida de açãofalse: 0 arms/cliques de registro e recibo de aprovação preservado. Estado jáaprovado exige essas mesmas condições antes do binding/registro.

Diagnóstico adicional permitido apenas como enums fechados por predicado nos campos existentes: COMPETENCE_PRESENTATION_GATE_ANALYSIS,COMPETENCE_PRESENTATION_GATE_OPINION,COMPETENCE_PRESENTATION_GATE_PORTAO,COMPETENCE_PRESENTATION_GATE_PERCENT,COMPETENCE_PRESENTATION_GATE_ACTION. Manter COMPETENCE_PRESENTATION_STATE para pós-estado incoerente. Sem novos campos, valores livres, corpo, mensagens ou logs privados. Não aplicar esses motivos retroativamente ao R16.

## Arquivos e prova

Somente quatro arquivos:
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs

Nenhum SRC/public/tipos/deps/YAML/ENV/secrets/RPC/SQL/RLS/Storage/deploy/PROD. Preservar void204 e todos os guards; adicionar somente RECOVERY_R16_LEDGER/RECOVERY_R16_OPINION se necessários aos catálogos fechados. Não mudar reader nesta etapa.

Writer preserva24dados atuais em ordem e acrescenta receipts-r16.json byte exato e recovery-r16.json canônico, mode0600,26dados+SHA27/HISTORY23. Manifesto26 linhas e SHA reais em escrita de integração. Os três raw e documentos históricos não serão reformatados.

TDD antes do fix: usar present real extraído ou chamado no consumidor, DTO completo aceito pelo parser real do SDK, snapshotnull/0/canonical100 alcançando apenas a fronteira do comando oficial; não fabricar confirmação. Negativos99.99/false/contexto negam antes de comando. Pós-ACK inválido/snapshotnull/0/readback anterior/foreign/aprovaçãofalse não liberam registro. DocR16 ausente ou adulterado, orçamento antigo, replay dos4efeitos e ambas as provas obrigatórias devem produzir RED causal, sem import/syntaxerror como evidência.

Atualizar fixtures técnicas para operações ainda legítimas, sem habilitar replays nem retirar prova de owner/identidade. Preservar o ensaio nativo do SDK de fila assíncrona e o selo de recuperação em Chromium, com estados técnicos coerentes e cobertura explícita dos dois pareceres aprovados. Não reduzir asserts/casos18/timeout ou usar exceção de teste no código de produção.

GREEN Node afetado, lint/fmt, diffcheck, Zero/LOCK/18nativos/probe110módulos1476785bytes0024/8FQ no HEAD final e revisão independente0C/I antes de merge normal com expectedHEAD. Confirmar o hash10749 com Nodecrypto antes de GREEN. Preservar sourceOrdering/preflightDrain e Master0GET/cache/frescor30s/deadline60s/retry2x<=5s.

## Pedido futuro e continuidade

Gastar R16, preparar apenas a nonce futura trilha-a-fixtures-20261109-r17 e exigir ancestralidade deste GATE/BUILD/PLAN e anteriores na verificação Git. Nenhuma solicitação por este GATE: depois de BUILD integrado e pushCI/frescor, um JSON7campos separado terá CI2/revisão canônica/merge/freeze/originaisattempt1. Não repetir R16, as14confirmações ou duas reservas.

AUDIT_BINDING_PENDING continua. Esta infraestrutura não seleciona casos de auditoria: preservar a TrilhaA184 e seu histórico; outros recortes Trilha C são governados em suas próprias execuções e não selecionam, reduzem ou substituem a prioridade vigente desta issue317: EXATOS184 novos, preservando24 históricos nas duas origens. Revisões antigas ficam em suas origens; não proibir genericamente as capturas184 exigidas pelo AppShell atual. Preservar API42596392357/art13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795. Atualizar138/317 e não certificar27/V1 por CI ou fixture técnica.

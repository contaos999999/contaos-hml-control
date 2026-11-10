# PLAN R20: corrigir sequência de revisão e preservar R19 sem Auth

Base cd2b221beaf1c6641d0646c4ab5a3c7baf4be1b0. Missão autorizada: concluir C8/64, UI C13 e controles reais HML. V1 não certificada. Especificação: GATE R19 d51d3fcd e PLAN C8 #554; recuperação continua readonly e sem negócio.

## Falha comprovada e causa
Request #559 integrou JSON7 correto e CI verde, mas omitiu review COMMENT canônica no HEAD4b96aafc. Original Fixtures42785459940/attempt1/headcd2b221b falhou REQUEST_REVIEW no preflight job129725421600/step7; protocolo129725424236 e privado129725699256 SKIPPED, artifacts0. Oposto Auth42785460060 request129725421530 SUCCESS e privado129725590328 SKIPPED. Não houve par sintético, Auth, browser privado, recibo ou logout a declarar. Não reexecutar R19; não alterar checks para aceitar revisão ausente.

## Recorte fechado
BUILD posterior ao GATE separado, apenas scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Substituir nonce futuro fixtures por trilha-a-fixtures-20261110-r20 e acrescentar R19 à lista spentFixtureNonces. O controlador de review continua exigindo último COMMENTED de contaos9999 no HEAD exato com JSON canônico; nenhum fallback. R19 passa somente histórico, nunca solicitação ativa. Não modificar preparador, readonly, negócios, native18, DTO, fontes, consumidor privado, YAML, deps, produto, Supabase, AuthAdmin, banco ou PROD.

## Tarefa única e verificação
- [ ] RED: parseSingleRequest aceita R20 e nega R19 ativo; histórico R19 é aceito só com historical:true.
- [ ] RED negativo de review ausente/inválida/HEAD errado continua REQUEST_REVIEW; review canônica positiva mantém aprovação.
- [ ] GREEN: duas mudanças literais de nonce/spent, sem remover pré-condições.
- [ ] Executar testes request focais, suíte auditor/preparador, lint/formato e CI4/native18 no HEAD final. Revisão independente sem C/I e integração protegida.
- [ ] Request R20 separado JSON7 com pai main exato, AUTO_DISCOVER, CI2 e review COMMENT canônica realmente publicada e relida ANTES do merge.
- [ ] Congelar main/deployment antes merge até dois subscribers originais attempt1 terminais. Não dispatch/rerun. Inspeção só após artefato real.
- [ ] Concluir recuperação sob contrato R19 original: ledger19,17confirmadas+2reservas,newArmed0,recibos vazios,completedtrue/logouttrue/cleanupnull/bindings completos. Não repetir efeitos ou consultas administrativas.
- [ ] Depois GATE C8 com pins reais, captura64/UI13 e revisão de evidências. Prova API51 preservada.

## Rollback e riscos
Rollback por PR apenas do controlador, sem reescrever request/história. Riscos: confundir preflightSUCCESS comAuth, aceitarreview ausente ou mesma solicitação consumida. Testes acima e readback antesmerge mantêm controles. Esta preparação não declara C8 ou V1 certificadas.

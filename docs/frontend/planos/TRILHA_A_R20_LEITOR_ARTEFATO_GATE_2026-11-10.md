# GATE R20: inspeção protegida do original somente leitura

Base main79b728cb12e7b1df037c5816c27842c0ef042d2b. Deriva do PLAN R20 #560 e GATE #561 integrados, do contrato R19 readonly #551 e do leitor protegido #548. Missão C8/64 autorizada pelo titular. Este GATE não autentica app, não executa SQL/negócio, não captura tela e não certifica.

## Origem terminal real
Request563/head091682831613454fc7cde78c78d1b76aaddf9b90/merge79b728cb, pai247c70df; revisão canônica5839300430 relida antesmerge. Upstream42788083679SUCCESS, LOCK42788083523SUCCESS. Fixtures42788354465attempt1SUCCESS: preflight129735171394SUCCESS, protocolo129735173939SKIPPED, privado129735702128SUCCESS. OpostoAuth42788354696SUCCESS/privado129735377081SKIPPED. Freeze original encerrado com ambos terminais; não rerun/dispatch.

Artefato único13751191411, nome trilha-a-fixtures-42788354465-1,33862bytes,ZIP SHA256142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536, não expirado. Logs comprovam native18 noHEAD79b e SHA256SUMS31arquivosOK. Conteúdo report/bindings/ledger/logout AINDA NÃO INSPECIONADO; SUCCESS não preenche esses campos.

## BUILD fechado após CI/revisão/merge deste GATE
Somente scripts/hml/inspect-fixture-artifact.mjs e inspect-fixture-artifact.test.mjs. Retargetar PIN literal ao original acima e upstream/jobIDs/conclusões exatas. Manter workflow YAML intacto: inspeção automática no push protegido que altera leitor. Não novo ENV/argumento/host/token/endpoint/transporte ou download manual.

Manter tool actions/download-artifact d3f86a106a0bac45b974a628896c90dbdf5c8093 e bundledist374211f852b2a8155a0211c72e85dacc81bb69f3, loader FD/path/root/digest/outputprivacy, metadata bounded deadline, ordem e schema públicos originais. Nenhum suporte a PNG/DOM por este leitor.

FILES passa de28para30dados na ordem original mais receipts-r18.json e recovery-r18.json; SHA31arquivos e HISTORY27. História anterior25hashes byte-exatos. receipts-r18.json2524bytes/SHA1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77; recovery-r18.json8003bytes/SHAde5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac, ambos literais já aprovados noDocR18 do produtor79b. Não reescrever ledger dos documentos históricos.

Contrato corrente readonly: ledger quando presente count19/priorConfirmed17/priorReserved2/newArmedCount0/maxIntentions24/maxNewIntentions5,flagsfalse; recovery confirmedBefore17/maxNew5; receipts atuais vazios canônicos55B. Não admitir novos recibos/arms como sucesso. Report parcial continua representável com failure/diagnostics literais e ledgernull quando produtor permite, sem converter parcial emcompleted/logout. Apenas códigos novos RECOVERY_R18_LEDGER,RECOVERY_R18_BINDING,RECOVERY_READ_ONLY do produtor podem ser acrescentados por enum literal, sem prefixolivre. Bindings continuam shape fechado/contextos exatos do produtor; nenhum texto livre, chave extra ou data/história inventada.

## TDD e integração
- RED pinsR20, metadataSUCCESS/jobIDs únicos, tentativa2/artefatoextra/digesterrado/ownerforeign recusados.
- RED 30dados/HISTORY27 e históriaR18exata;29/28dados,símbolo/link/traversal/oversize/manifestdivergente falham.
- RED ledger19/zeroarms/55Bvazio válido e15/17antigos/arm/recibo/flag/confirmedBefore/max5divergentes negados. Fixtures técnicas atuais se ajustam ao contrato readonly; raws históricos nunca alterados. Guardas negativas anteriores permanecem exercitadas, sem reduzir testes ou skips para ocultar falha.
- GREEN suíte leitor, lint/formato/diff, CIZero/LOCK/Inspection noHEADfinal, revisão independente semC/I, merge normal/pushCI.
- Consumir exclusivamente proof automática original do novo leitor apósmerge. Verificar30hashes/HISTORY27, reportcompletedtrue/logouttrue/cleanupnull/ledger19/zeroarms/receiptsvazios/bindings completos atuais antesGATEC8.
- A inspeção não reautentica HML, não consome orçamento5, não repete API51 ou UImultiturnc999 e não altera fonte implantada0024/dpl8FQ.

Rollback somente porPR do leitor, sem apagarrequest/recibos. Se conteúdo contraditório, registrar causa e corrigir causalmente sob plano próprio; não emitir certificado. C8/64 eUI13 continuam pendentes até provas próprias.

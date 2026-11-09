# GATE: inspeção protegida do artefato original R16

Este aditivo nominal incorpora o PLAN457/GATE458 do leitor, o GATE519 da inspeção R15 e o GATE527 da recuperação. A arquitetura de leitura permanece igual. Exigir CI, revisão independente e integração deste documento antes do BUILD de dois arquivos. Não autoriza autenticação, negócio, nova solicitação, rerun, deploy ou alteração de segurança.

## Origem imutável comprovada

R16 foi solicitado pelo PR530, HEAD `8ec82380ca6fcf74b0c6c9a9585667ca273f5193`, revisão canônica5833820222 e CI42713167315/42713167218 SUCCESS. Merge original S=`10cac45b655d5eece9881fdf83545887c371d548`, pai aprovado9084eaab56d7ffe74059eb19ab1f555ff58c4630. Todos os originais attempt1 terminaram:

| Objeto | Identidade e resultado |
| --- | --- |
| Upstream |42713471816, workflow406076025, push/main/S, SUCCESS|
| Fixtures |42713640896, workflow411426169, workflow_run/main/S, FAILURE|
| Request |129489390633, SUCCESS|
| Protocolo |129489393425, SKIPPED|
| Privado |129489866611, FAILURE no step16|
| Auditoria oposta |42713640998 SUCCESS, privado129489597652 SKIPPED|
| Artefato único |13717457216, trilha-a-fixtures-42713640896-1|
| ZIP |25487bytes, SHA25639eb9b34bd2c3b58df9b28cb666e0911538b24763eeb744f75fd5675a91a7305, notexpired|

O diagnóstico público é apenas FIXTURE_PREPARATION_INCOMPLETE, às22:44:37Z. Hashcheck17 e upload18 passaram. Isso não identifica causa, login, logout, contagem ou bindings. R16 foi consumido e não será reexecutado.

Fonte em S: auditor Gitblob a3238f4207e5058cf806af95edb35f5b871159a7; preparador9d33527830f60a681332b14412fae28d5d6a9b31. YAML Fixtures9af69f3ae0797cd4f0e9713950e473bc1b4a8f17 e Audit848acf35a51bb5b420d5cf9047972da4a75a98eb permanecem fixos. Repo1442722734/owner352205055. Produto0024b3c6739ab6296ec12338f11cf792d3a5f84b/HMLdpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh.

## Escopo fechado do BUILD

Somente:
- scripts/hml/inspect-fixture-artifact.mjs
- scripts/hml/inspect-fixture-artifact.test.mjs

Atualizar os pins e a matriz dos três jobs para os originais acima. Manter verificação fechada de run/upstream/artifact/lista/attempt/jobs, identidade, origem, branch, workflow, resultado, digest, tamanho, unicidade e expiração. Sem seleção por input, URL arbitrária ou formato genérico.

FILES preserva as22 entradas atuais e acrescenta, nesta ordem, receipts-r15.json e recovery-r15.json. São24 dados mais SHA256SUMS,25 membros e24 linhas de manifesto. HISTORY preserva19 hashes e acrescenta:
- receipts-r15.json:3652e7766ef218067642137effb805d448c72f86da3c402a583b5fcf7aa29007,1299bytes;
- recovery-r15.json:de792c8803bbe232871c9eac468ad8baede31a88b1ec5aa238647a15267b645a,6244bytes.

Esses textos derivam do documento R15 canônico do produtor, validado por Nodecrypto no BUILD529. Os12 campos, os três raw originais e os hashes de R13/R11 permanecem byte a byte. O relatório R16 continua desconhecido; não gerar fixture que se apresente como resultado original.

## Schema do produtor R16, sem ampliar divulgação

Preservar chaves e tipos fechados de report, receipts e observation. Aplicar somente o orçamento do produtor R16:10 confirmadas,2 reservas, base12, máximo12 novas intenções, teto24; ledger.count entre12 e24 e newArmedCount=count-12. recovery.maxNewIntentions deve ser12; cardinalidade de novas intenções no máximo12. Ledger ausente, frozen, pending, sent ou recibos incompletos/incertos continuam UNKNOWN, nunca zero ou confirmed por inferência.

Adicionar UUID R15 `6e6b6afb-2216-42ef-bd89-571301e97e1f` aos IDs históricos negados. Preservar a negação R11 e negar também o hash conhecido da aprovação incerta R15 para aprovar_parecer_interno:bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3, mesmo com requestId novo. Não promover ou reembolsar reservas. Acrescentar somente os dois enums literais existentes no produtor:RECOVERY_R15_LEDGER e RECOVERY_R15_OPINION; enums desconhecidos continuam bloqueados. Não importar a aplicação/preparador nem reconstruir regra de negócio no leitor.

## Segurança, testes e leitura real

Manter o workflow atual intacto: testes PR sem secrets/environment/actions token; leitura automática em pushmain somente dos dois paths, contents:read/actions:read. Mesmo downloader oficial d3f86a106a0bac45b974a628896c90dbdf5c8093/bundle374211f852b2a8155a0211c72e85dacc81bb69f3. Capturar stdout/stderr privados; exigir digest calculado único e exato, sem warning/mismatch. Sem parser ZIP próprio ou download por outra rota.

Preservar deadline único30s, limites de bytes, fd ancorado/NOFOLLOW/fstat, canonicalJSON, own-data/enums, hashes de todos os membros, zero output parcial e nenhuma mídia/PII/cookie/storage/ENV/payload bruto.

RED causal primeiro no leitor real: metadados R16 legítimos e diretório24 ainda rejeitados; formato22 antigo e orçamento10+1+13 indevidamente aceitos; replay UUID/hash R15 rejeitado depois do fix. Testar positivos técnicos com orçamento10+2+12 e negativos de histórica alterada/ausente, metadata antiga, enums desconhecidos, reserva ou cardinalidade incorretas. Preservar todas as negativas anteriores e seus objetos históricos.

GREEN Node afetado, lint/fmt, Zero-Drift, LOCK e revisão independente no HEAD final antes do merge normal com expectedHEAD. A leitura pushmain é somente do artefato imutável R16, não outro preparo HML. Conferir FIXTURE_INSPECTION_PROOF completo e hashes antes de diagnosticar saldo, causa, logout ou bindings.

## Continuidade

Somente após a prova real definir a correção afetada ou o gate de auditoria. Manter AUDIT_BINDING_PENDING enquanto faltarem bindings reais. Nesta execução da Trilha C, seguir o recorte do titular:8 IDs/64 combinações, preservando19 anteriores sem repetir testes; não elevar inventário antigo sem PNG/SHA a certificado. Trilha A ampla permanece registrada separadamente, sem ampliar o recorte autorizado aqui.

Preservar API42596392357/artefato13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795. Nenhum deploy ou PROD. Atualizar backend138 e frontend317 com HEADs, CI, prova e próxima ação. Falha do leitor permanece bloqueio, sem rerun/Auth/compensação.

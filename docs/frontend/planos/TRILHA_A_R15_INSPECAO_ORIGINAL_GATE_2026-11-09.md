# GATE aditivo: leitura protegida do artefato original R15

Incorpora integralmente PLAN457/GATE458 da inspeção somente leitura e a etapa de leitor futuro após artefato terminal prevista no PLAN513/R15 e GATE515. É uma atualização nominal do alvo do leitor existente, sem arquitetura nova. CI e revisão independente deste GATE integrados antes de BUILD. Não autoriza Auth, SQL, novo request, rerun, deploy ou certificação.

## Baseline comprovado e limites

BUILD517 integrado6cb474955a254106f19dee8aa1660b989094a61d, HEAD81bc80883b84a64b8980892116a1276fc03033cb, quatro CIsSUCCESS e revisão5833021426. Request518 HEAD338455458409f3a2675f9e2272257c4d44e3d183, revisão canônica5833080951, CI42702921697/42702921910SUCCESS, merge S=dd895a5c30acbb39c821153d86477985ae94b939.

Originais attempt1 terminados: upstream42703248266SUCCESS, workflow406076025/push/main/S; Fixtures42703523206FAILURE/workflow411426169/workflow_run/main/S; Audit42703523239SUCCESS, privado129454400654SKIPPED. Fixturesjobs exatos:129454201287/requestSUCCESS,129454203909/protocolSKIPPED,129454678528/privateFAILURE. Step16 FIXTURE_PREPARATION_INCOMPLETE21:37:46Z;17hashcheckSUCCESS e18uploadSUCCESS. Esse enum não explica a causa, contagem nova, login, logout ou bindings. Não assumir zeroAuth/negóciozero. R15 consumido, nunca rerun.

Artefato único13713326447, nome trilha-a-fixtures-42703523206-1,22442bytes,notexpired,ZIPsha25649a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262. Owner352205055/repo1442722734. Frontend0024b3c6739ab6296ec12338f11cf792d3a5f84b/deploymentHMLdpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh. Fonte produtor imutável emS:auditor662be3567a6983b1c90e341f0ddb537247756cc4,preparador79a7384eba8acd22a460c4bde11acb14100d2e07,FixturesYAML9af69f3ae0797cd4f0e9713950e473bc1b4a8f17,AuditYAML848acf35a51bb5b420d5cf9047972da4a75a98eb.

## Allowlist fechada

Somente scripts/hml/inspect-fixture-artifact.mjs e scripts/hml/inspect-fixture-artifact.test.mjs. Não alterar YAML existente, auditor/preparador/UI507, SRC/public, tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19, dependências, segredos, fonte/deployment ou backend.

Substituir apenas pins de metadados R13 pelo alvo R15 acima e matrizes dos três jobs reais, mantendo run/upstream/workflow/event/branch/attempt/status/origem/digest/unicidade fail-closed. Preservar schemas de report/receipts/observação derivados do produtor, incluindo recuperaçãoR13 e orçamento10confirmadas+1reservada+13novas/teto24. Não rotular negativos técnicos como relatório original.

FILES: manter as vinte entradas atuais do leitor na ordem, acrescentando receipts-r13.json e recovery-r13.json, exatamente como writer emS. Exatamente22dados+SHA256SUMS=23membros,22linhas de manifesto; nenhum nome extra/nested/symlink/hardlink. HISTORY preserva17 hashes e acrescenta receipts-r13.json=fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf e recovery-r13.json=92bf8114d857b2061b0a2ce67cfb908f2dd1c71e1800b567bfecf52c17e12da9, total19. São bytes históricos já comprovados pela inspeção42687417968 e documento canônico3108bytes do produtor; não reconstruir prova do reportR15 desconhecido.

## Invariantes de segurança e execução

Preservar o workflow de inspeção existente: PR somenteNode24/lint/fmt sem tokenactions/environment/secrets; pushmain dos2paths executa automaticamente uma leitura protegida com contents:read/actions:read, sem dispatch/inputs arbitrários/rerun. Mesmo downloader oficiald3f86a106a0bac45b974a628896c90dbdf5c8093/bundle374211f852b2a8155a0211c72e85dacc81bb69f3,stdout/stderrprivados capturados,exit0 e digestcalculado literal único obrigatório,zero warning/mismatch. Deadline30s e limites256KiB/64KiB/4096B,fdancorado/lstatNOFOLLOW/fstat,JSONcanônico/own-data/enums e zerooutputparcial inalterados. Não baixar ZIP por outra rota nem imprimir logsbrutos/PII/cookies/ENV.

RED causal focal antes do fix: exigir pinsR15/FILES22/HISTORY19 e rejeitar históricoR13 ausente/trocado, metadataR13 antiga/IDsjobs errados. Preservar todas negativas existentes. GREEN realCI inspector+Zero+LOCK e revisão independente no HEAD final. Merge normal com expectedHEAD apenas após gates; uma execução pushmain readonly produz FIXTURE_INSPECTION_PROOF completo. Leitura do artefato imutável não repete AuthR15.

Somente após conferir saída real/hashes será permitido concluir causa/ledger/logout/bindings e propor correção focal em novo PLAN/GATE se necessária. Nenhum fallback, liberação de AUDIT_BINDING_PENDING ou certificação das8telas/64casos/27telas/V1 por este leitor. Preservar19inventariadas e API42596392357/art13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795.

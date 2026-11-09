# GATE R16: recuperação obrigatória da intenção incerta R15

## Vínculo e ordem

Plano único PR522 integrado f8acc6dbff3746c7f6d5540e1ee25beb316c4d0d. GATE void PR525 integrado 8d5a40bf687bc7b5b0b6fe2404d5302f13ed8cfe. BUILD void PR524 é proposta em revisão; sua integração só ocorre após os testes e a revisão exigidos pelo GATE525. Este documento é o GATE separado da recuperação, não outra solicitação de execução. Exigir CI, revisão sem Critical/Important e merge normal deste GATE antes do BUILD consumidor. Preservar os ancestrais e não reescrever história publicada.

Escopo de código posterior: somente scripts/hml/prepare-visual-fixtures.mjs, scripts/hml/prepare-visual-fixtures.test.mjs, scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Sem mudanças em SRC, tipos, dependências, YAML, ENV, secrets, SQL, RPC, RLS, Storage, deployment ou PROD. Types permanece blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19. Reader de artefatos só poderá evoluir em GATE próprio; o reader R15 atual não será relaxado para aceitar novo layout.

## Evidência literal e documento fechado

R15 original run42703523206/head dd895a5c30acbb39c821153d86477985ae94b939, artefato13713326447, ZIP22442bytes/SHA25649a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262. Inspeção42705850329/job129462302474 validou22 arquivos de dados mais SHA256SUMS. Usar exclusivamente reportRaw/receiptsRaw/observationRaw publicados por FIXTURE_INSPECTION_PROOF, sem reformatar esses três textos.

Documento canônico R15: schema contaos.fixture.recovery-r15.v1, workflowRun "42703523206", artifactId "13713326447", requestId "trilha-a-fixtures-20261109-r15", harnessSha do produtor original, zipSha256 acima, reportSha256, receiptsSha256, observationSha256, reportRaw, receiptsRaw, observationRaw. Esses12 campos nessa ordem, serialização JSON.stringify(doc,null,2)+"\n", total6244bytes, SHA256de792c8803bbe232871c9eac468ad8baede31a88b1ec5aa238647a15267b645a.

| Texto original | Bytes | SHA256 |
| --- | ---: | --- |
| report.json | 3364 | 038d291631f6d0badc89c014cbfbb137557a780039fb16b8d5c1fc9e53dee3c6 |
| receipts.json | 1299 | 3652e7766ef218067642137effb805d448c72f86da3c402a583b5fcf7aa29007 |
| observation-diagnostic.json | 423 | fc97c8e25c55840331737b307680f9846b11f0b2e455a04154230a99b455a614 |

Validar chaves próprias de dados enumeráveis e exatas; rejeitar proxies, getters, símbolos, extras, ausências, alterações, hashes divergentes e documentos de outra rodada antes de qualquer AppAuth. Controller e preparer devem exigir esse documento em todos os caminhos de entrada e de recuperação. Exportar somente enum de erro fechado RECOVERY_R15_LEDGER e, se necessário, RECOVERY_R15_OPINION, nos catálogos consumidores próprios, nunca corpo/erro bruto.

Report original: OBSERVATION_FAILED, FINAL_READBACK, subphase RUNTIME_FRESH, completedfalse, logoutVerifiedtrue, v1Certifiedfalse. Ledger12 com10 confirmadas históricas,1 reservaR11 e1 nova intençãoR15 armada/enviada/incerta, frozen/pending/senttrue, maxIntentions24 e maxNewIntentions13 no produtor antigo. Observação: RPC:aprovar_parecer_interno/RESPONSE_PROJECTION/statusHTTPNONE/requestFailureNONE. Status e corpo HTTP originais continuam desconhecidos. Void204 é contrato legítimo coberto pelo fix, não resposta original reconstituída.

Recibos originais sealed→uncertain: rpc aprovar_parecer_interno, requestId6e6b6afb-2216-42ef-bd89-571301e97e1f, payloadSha256bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3, org/contrato/identidade originais. Não promover esse recibo a confirmed por ACK, leitura posterior ou inferência; confirmação histórica permanece UNKNOWN.

## Orçamento e negação de repetição

Manter10 confirmadas mais2 reservas históricas, base12, máximo12 novas intenções, teto24. A segunda reserva conta antes de Auth e nunca é reembolsada por ausência de linha ou por leitura de estado aprovado. Atualizar todos os consumidores, relatório e broker de maneira coerente; nenhuma tolerância ao orçamento anterior13.

Incluir UUID históricoR15 em usedIds. Além de UUID/hash, negar semanticamente a repetição R11 solicitar_parecer_interno para Outubro e R15 aprovar_parecer_interno para o parecer de Outubro. A negação deve sobreviver a requestId novo, nova chave de idempotência, mudanças no fundamento ou campos equivalentes. Vincular parecer à competência pela prova contextual selada; não confiar em evidence fornecida pelo chamador nem aceitar um ID de Outubro como se fosse Setembro. Enquanto a prova não estiver obtida/consumida, manter broker de negócio em modo somente leitura.

Reutilizar a reconciliação oficial UI/GET já existente, com geração/ordinal e orçamento, na competência Outubro50c26274-a36f-48e0-b2fe-5a1caf5d6a49, org e contrato FIXTURE. Exigir leitura completa, posterior e contextual de pareceres_internos; pin de ID, versão e hash no token opaco vinculado ao broker e à identidade da execução. Não trocar por consulta SQL, REST privilegiada ou estado inventado. Preservar invalidação por ausência, mudança de identidade/versão/hash, leitura em voo/estrangeira e qualquer divergência de estado. Antes de QUALQUER arm, inclusive Setembro, exigir parecer aprovado, aprovado_em válido, maior versão única e hash64 no GET contextual fresco sob fence. Se ausente, rascunho ou divergente, manter o broker sem escritas e falhar antes de arm. Não reenviar a aprovação incerta nem promover recibos para desbloquear fixtures.

## Produtor e solicitação futura

Persistir receipts-r15.json byte a byte e recovery-r15.json canônico, com mode0600, em todos os resultados terminais normais. Preservar os22 arquivos anteriores, total24 dados mais SHA256SUMS25; histórico passa de19 para21 entradas, com hashes originais. Testar manifest exato, nomes únicos, contagem, zero divergência e hashes após a escrita real. Não adaptar o reader R15 neste BUILD4mjs; inspeção do novo layout exige revisão própria.

No controller, preservar nonceR15 como gasto. Só preparar nonceR16 separado e descendência obrigatória dos merges dos dois GATEs e BUILDs, sem aprovar parent desconhecido. Testes de request devem continuar rejeitando REQUEST_PARENT incompatível, tentativa2, rerun, dispatch, nonce repetido e Auth com documentos faltantes. Este GATE e seu BUILD não enviam solicitação, não abrem sessão e não executam negócio. Solicitação futura será um único commit revisável depois de todos os gates, com parent exato e HML existente0024b3c6739ab6296ec12338f11cf792d3a5f84b/deploymentdpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh, sem nova implantação.

## RED, GREEN e revisão

Antes do fix, testes reais dos consumidores devem falhar causalmente por documentoR15 ausente/adulterado não rejeitado, reserva incorreta ou replay semântico admitido. Não usar import ausente, syntaxerror ou função espelho como RED.

Cobrir documento canônico e negativos estruturais; preflight que bloqueia antes de Auth; orçamento inicial12 e teto24 sem devolver reservas; UUID e replay semântico com IDnovo/fundamentodiferente; broker sem prova ou com prova de outro owner/execução; parecer ausente/stale/emvoo/foreign/outroID/versão/hash/estado/timestamp; preservação dos recibos e das negações R1/R5/R8/R11; operação distinta legítima de Setembro; writer24+SHA25 por integração real e manifest/hashes fechados; REQUEST_PARENT e nonce gasto. Garantir que uma simples constante ou snapshot não substitua efeito observável no consumidor real.

GREEN exige suite Node afetada, lint, formato, diffcheck, Zero-Drift, LOCK-TYPES e TesteC aplicável no mesmoHEADfinal. Reexecutar somente checks necessários pela alteração. Não converter mocks ou CI documental em prova autenticada. Revisão independente sem Critical/Important antes de merge normal com expectedHEAD; sem force/rebase/squash.

## Escopo e continuidade

Escopo prioritário vigente é Trilha A184 casos, derivados de208 privados menos24 históricos V114/V116/V118 em oito combinações, preservados nas duas origens. As oito telas citadas pelo titular são pendências dentro da continuidade e não substituem184 por64. Preservar a evidência antiga nas origens; os184 casos novos requerem suas próprias capturas, DOMs, hashes e revisão após a mudança do AppShell. Excluir somente os24 históricos vinculados nas duas origens. Manter72 critérios e V1 não certificada até prova integral. V117/V119/V120 e AUDIT_BINDING_PENDING continuam pendentes até fixtures e bindings reais revisados.

Preservar a prova API42596392357/artefato13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795 sem repetir. Atualizar checkpoint frontend317 e backend138 após a execução, com HEADs, CI, recibos, pendências e impedimentos verificáveis. Rollback é revert pelo fluxo protegido, sem apagar recibos ou consumir nova intenção.

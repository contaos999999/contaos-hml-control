# PLAN P0 da Fase 7 CODE

**ContaOS 4.1 · Integração Funcional V1**

A Fase 7 executa as seções 9 e 13.9 do plano mestre da PR #653, após a certificação efetiva da Fase 6 na PR #815. A PR #781 disciplina a revisão técnica assistida por Edivan5002. O escopo prospectivo vincula a BUILD #816 à base `a8587643ae91e544d869454ff5b7d702d65435e9` e ao backend normativo `a1516de1d8949e505d83b5e000eb1cc558b217a7`.

## Critérios de aceite

- Reconhecer seis certificados integrados, com ancestralidade, árvores, blobs, SHA-256, revisões e CI vigentes no HEAD de cada PR. Usar o recibo documental histórico da F1 e reexecutar seu verificador no snapshot certificado.
- Preservar os 52 casos autenticados do certificado F2 no produto e deployment fixados. A R10 fornece 51 casos preservados sob o rito incremental, com a conclusão original do run registrada. A R14 fornece o caso 52 e os controles de fechamento.
- Conciliar os 138 IDs do CSV protegido com a matriz estática da F1, as superfícies, o invariante, o produtor/consumidor e os pares de prova das Fases 3, 4, 5 e 6. Exigir 120 obrigatórios, 18 condicionais aplicáveis, 276 provas por fase e quatro jornadas complementares da F6 com oito provas.
- Verificar tentativas e artefatos nativos, ligar os recibos ao ledger versionado e produzir matriz reproduzível. Manter as provas anteriores nos escopos próprios. Verificar produto comparável e a origem do Teste C da F6.
- Executar contraprovas de substituição de ID, prova omitida, troca de escopo, digest inconsistente, revisão ou run incompatível. Regressão integral, Zero-Drift, LOCK-TYPES, P0-NR, revisão assistida no HEAD exato conforme #781, merge protegido e readback.
- Integrar recibo, manifesto, certificado e SHA256SUMS em PR documental própria após a reconciliação. V1 CODE com LIVE NOT_RUN e PROD NO-GO. A Fase 8 solicitada terá plano de consolidação que preserva o certificado histórico.

## Caminhos exatos do BUILD

- `docs/frontend/auditorias/integracao-funcional-v1/fase7/F7_CODE_SOURCES.json`
- `docs/frontend/auditorias/integracao-funcional-v1/fase7/F7_CODE_TRACEABILITY.json`
- `scripts/hml/integracao-v1-fase7-code-reconcile.mjs`
- `scripts/hml/integracao-v1-fase7-code-reconcile.test.mjs`
- `.github/workflows/contaos-f7-code-reconcile.yml`

## Caminhos da certificação documental separada

- `docs/frontend/auditorias/integracao-funcional-v1/fase7/F7_CODE_RECONCILIATION_RECEIPT.json`
- `docs/frontend/auditorias/integracao-funcional-v1/fase7/F7_CODE_CERTIFICATION.json`
- `docs/frontend/auditorias/integracao-funcional-v1/fase7/CERTIFICADO_FASE7_CODE.md`
- `docs/frontend/auditorias/integracao-funcional-v1/fase7/SHA256SUMS`

O módulo de verificação deve bloquear a emissão do recibo se a matriz, os arquivos oficiais ou a cadeia nativa divergirem. A regressão será rodada no mesmo SHA do BUILD. O Teste C da F6 entra como prova herdada de árvore compatível. Qualquer alteração de produto exige revisão do impacto e execução visual aplicável sob novo escopo. Reverter por PR protegida e suspender a certificação em caso de regressão comprovada.

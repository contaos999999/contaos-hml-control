# Certificado IFV1_F3_CODE — Fase 3 de integração funcional V1

Data de referência: 24/11/2026 (America/Bahia). Escopo: exclusivamente certificação automatizada de código. **Resultado técnico: PASS_CODE — 138/138 casos, 276/276 provas, zero falhas e zero bloqueios.** A eficácia formal deste certificado depende do CI integral, revisão, merge protegido desta PR documental e readback na main; enquanto aberta, a PR é proposta de certificado, não liberação de F4.

## Decisão de governança
A emenda IFV1_F3_CODE_VS_GATE_PROD_LIVE_EMENDA_2026-11-22.md separa CODE de LIVE. A decisão específica posterior do titular de 24/11/2026, registrada em [PR #690, comentário 7148248800](https://github.com/contaos999999/contaos-hml-control/pull/690#issuecomment-7148248800), determina aferir a certificação individual pelos 138 testes automatizados efetivamente executados e rastreáveis, sem condicionar o certificado a parecer independente ou LIVE. Preservam-se as regras de proteção de branch/merge e o GATE PROD. As revisões técnicas via Edivan5002 foram assistidas pelo mesmo agente; não constituem auditoria humana independente. Não confundir esta certificação com a certificação semântica especial da PR #690.

## Produto e proveniência
- BUILD #752: HEAD da715ce7348a1def7a9ac18e1895ae7cd7eae15e, execução ec445264b5e2d901c96cfc5466e8ff23a4106095, merge 4f696f74453f5bd73a9334c090a3cf28ee968961, CI 6/6.
- Backend de referência do catálogo: 5eca44aebead3183e81b5c1af0d1dffa5fb8feb6; snapshot normativo a1516de1d8949e505d83b5e000eb1cc558b217a7. Não se declara validação operacional remota.
- Catálogo SHA-256 bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb.
- 120 relações obrigatórias e 18 condicionais, todas executadas; sem N/A, SKIPPED ou NOT_RUN.

| Etapa | PR / execução | Evidência |
| --- | --- | --- |
| BUILD funcional | #752 / [45528651072](https://github.com/contaos999999/contaos-hml-control/actions/runs/45528651072), job 138918169561 | Artefato 14982269982, ZIP SHA-256 9b5c4a960d49d4568a810d2c1498628d144ed59c3f4a83b4c7a3364c62869717; report SHA-256 0e44a1783523a67c0e7b6af5de93e5825cc476568fd751f757b25effb41642d2 |
| PLAN atestação | #755 | Merge 7734d9a235998e62bbb64b545dcc886740fffe71 |
| Atestação | #754 / [45530510437](https://github.com/contaos999999/contaos-hml-control/actions/runs/45530510437) | Artefato 14985165418; HEAD b26ece8c0b03485aeeb7091aaed548ec284986cd; merge a162574386e752d3f9b928dbf8e3296d3a62255b; CI 7/7 |
| PLAN promoção | #757 | Merge 7449b268c7c27b1cdc6bfbf024ae7939b2cc1fca |
| Validação do ledger | #756 / [45536232935](https://github.com/contaos999999/contaos-hml-control/actions/runs/45536232935), job 138943384210 | Artefato 14987570069; ZIP SHA-256 38adc0c7bc3d47294f227e8c4b2ae60dcaa8f3069b2a797fdc9c589a65be9fb9; HEAD 7ae803d01c5ec6a2210a6175ed3156318f22da45; execução b6d9737f8afd14e009a9aff3fe0f6c843eca9d53; merge d0f6b3e5748e1785e27d6c975642897bb6d34676; CI 8/8 |

O diff entre execução de promoção e merge #756 está vazio, verificado pela API GitHub. Os controles de Zero-Drift, LOCK-TYPES, Anti-Reincidência, regressão, typecheck, preflight, atestação e execução funcional foram aprovados nos respectivos escopos. Teste C de produto aprovado no BUILD #752; alterações documentais posteriores não equivalem a nova execução visual.

## Ledger e validade
O arquivo versionado F3_CODE_ATTESTATION_CANDIDATE.json (SHA-256 de6fdd18468868fc163574fccda016322a2eb7e412bb984a0212fb783c770c06) é a fonte integral dos 138 casos e das 276 provas. O recibo F3_CODE_PROMOTION_RECEIPT.json reproduz o resultado do job de promoção, que validou a igualdade byte a byte entre arquivo versionado, arquivo baixado e atestação reproduzida com o ZIP original, bem como metadados, catálogo, fontes, expectativa e pares de prova. A denominação histórica e os estados SUBMITTED_UNVERIFIED do artefato original são preservados por integridade; seu resultado de validação é interpretado em conjunto com o recibo integrado e este certificado, não por edição dos dados originais. F3_CODE_EVIDENCE_LEDGER.json e F3_LEDGER.json permanecem intactos como inventário histórico e ledger LIVE, respectivamente.

## Limites
Os testes CODE usam adaptadores reais do frontend com transporte/persistência em fixtures controladas; não atestam RLS remota, autenticação operacional, persistência HML ou segurança PROD. O artefato vincula hashes das observações, sem conter todos os payloads brutos. Não há alegação de contraditório humano independente. Nenhum gate foi relaxado nem resultado foi produzido manualmente. A decisão expressa do titular limita a certificação individual a provas CODE efetivamente executadas; contraprovas LIVE continuam no GATE PROD após V1–V5.

## Conclusão
Resultado técnico da Fase 3 CODE: **PASS**. Certificação formal **válida somente após merge protegido e readback desta PR**. Fase 4 CODE depende dessa integração válida e dos seus próprios requisitos de planejamento; GATE PROD permanece NO-GO. Não autoriza implantação em produção.

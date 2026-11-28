# Certificado global da Integração Funcional V1 CODE

**ContaOS 4.1 · Fase 8 de consolidação**

**Data** 26 de novembro de 2026

**Resultado** `IFV1_CODE=PASS` e `IFV1_F8_CODE=PASS` no escopo da integração funcional V1 CODE, com eficácia após CI, revisão técnica assistida, merge protegido e leitura dos arquivos na `main`.

## Certificações consolidadas

| Evidência | Resultado |
| --- | ---: |
| Fases certificadas da Integração Funcional V1 | 7 de 7 |
| Casos históricos de navegação da F2 | 52 |
| Conexões canônicas reconciliadas | 138 |
| Provas canônicas rastreadas nas Fases 3 a 6 | 1.104 |
| Provas complementares da F6 | 8 |
| Critérios históricos reconciliados | 488 de 488 |
| Critérios legados e normalizados | 416 e 72 |
| Regulares, atômicos V1/BRAND e NFR | 45, 25 e 12 |
| Decisões históricas PASS_REAL e aceites R-03 | 473 e 15 |
| Critérios sem resolução no inventário reconciliado | 0 |

A [Fase 7 CODE](https://github.com/contaos999999/contaos-hml-control/pull/818) está integrada em `f4395961bc7ccf2d66260ea61c97befa4e6f29f2`. A [certificação histórica da V1](https://github.com/contaos999999/contaos-hml-control/pull/591) permanece em `78f58e81b53d94defe4ac0e78e914ada7c47ba33`, com documentos originais, limites e decisões preservados. Os sete checkpoints originais do GATE backend #138 foram conferidos. Os identificadores e os textos dos 488 critérios coincidem com o inventário P0. Os 12 NFR mantêm as classificações do quadro específico de avaliação.

O produto da `main` no escopo verificado é compatível com o produto de navegação certificado na F2, `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97`. O delta de cinco arquivos a partir do produto histórico está ligado às PRs #598, #601, #622 e #637. A cadeia atual mantém o backend normativo `a1516de1d8949e505d83b5e000eb1cc558b217a7` e o blob protegido de tipos `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

## Proveniência e limites

A [consolidação #819](https://github.com/contaos999999/contaos-hml-control/pull/819) foi revisada no HEAD `2762abd98c21c9d8fc51ba82a8d2c7fdb6515782` e integrada pelo merge `d0280d0c2eb072868f7d6fddc08f4a2997ec0f0d`. [Revisão técnica assistida 6074061639](https://github.com/contaos999999/contaos-hml-control/pull/819#pullrequestreview-6074061639) de Edivan5002, conforme #781. O [run 45818730548](https://github.com/contaos999999/contaos-hml-control/actions/runs/45818730548), tentativa 1, publicou o recibo 15116413781, com SHA-256 `b6f3823dcdab007d2b47643fa0a832dca6af472dbdde4bbafc0f305c897d9471`.

As ressalvas históricas aceitas continuam registradas. R-01 cobre upload físico, tamanho e retomada. R-02 cobre worker e fila reais. R-03 cobre isolamento real multiusuário e entre organizações. LIVE `NOT_RUN` nesta consolidação. PROD `NO-GO`.

[Manifesto](V1_INTEGRACAO_FUNCIONAL_CODE_CERTIFICATION.json) · [Recibo](F8_CODE_CONSOLIDATION_RECEIPT.json) · [Fontes](F8_CODE_SOURCES.json) · [SHA256SUMS](SHA256SUMS) · [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708)

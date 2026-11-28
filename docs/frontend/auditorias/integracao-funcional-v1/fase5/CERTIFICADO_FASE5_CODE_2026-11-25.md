# Certificado oficial da Fase 5 CODE

**ContaOS 4.1, Integração Funcional V1**
**Data** 25 de novembro de 2026
**Resultado** PASS no escopo CODE_FIXTURE

A certificação entra em vigor após CI, revisão assistida, merge protegido e confirmação da leitura deste certificado, do manifesto e do recibo na main.

## Resultado material

| Medida | Resultado |
| --- | ---: |
| Casos executados | 138 de 138 |
| Casos obrigatórios | 120 de 120 |
| Casos condicionais aplicáveis | 18 de 18 |
| Provas positivas | 138 |
| Provas negativas | 138 |
| Total de provas | 276 |
| Falhas, bloqueios, casos omitidos e N/A | 0 |

As seis fatias integradas foram [#778](https://github.com/contaos999999/contaos-hml-control/pull/778), [#782](https://github.com/contaos999999/contaos-hml-control/pull/782), [#784](https://github.com/contaos999999/contaos-hml-control/pull/784), [#786](https://github.com/contaos999999/contaos-hml-control/pull/786), [#788](https://github.com/contaos999999/contaos-hml-control/pull/788) e [#790](https://github.com/contaos999999/contaos-hml-control/pull/790). A prova integral foi produzida pela #790 em um único HEAD `aa5640e52cec265e2b250fce9b1d85452763d0b0`. A árvore `f651eee882b30139e75caf4ffebb99a6fb780b09` foi conferida no merge `ee46e1ddde75b24954e61b0081b8ab6b167c127f`. Os sete workflows passaram no HEAD, incluindo Zero-Drift, Teste C, LOCK-TYPES e Anti-Reincidência. Os 12 artefatos foram conferidos e reproduzidos. [Run material](https://github.com/contaos999999/contaos-hml-control/actions/runs/45743224190) · [Digests](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7180992207)

## Atestação, promoção e revisão

A atestação validou a matriz canônica, os pares, as observações e a proveniência dos artefatos originais em [#792](https://github.com/contaos999999/contaos-hml-control/pull/792). [Run de atestação](https://github.com/contaos999999/contaos-hml-control/actions/runs/45744571463)

A promoção verificou a igualdade dos bytes oficiais, reproduzidos e versionados em [#793](https://github.com/contaos999999/contaos-hml-control/pull/793). O ledger promovido tem blob `8caedaea89a706f07d4f19eb7d7fb321f12a6d64` e SHA-256 `f4e37ec14b05db5bf1b849cdf4d95ea24169762dc2a380e10b057bbf7d4b6656`. O recibo tem SHA-256 `5811adb824af5b0e7629822effcb60f830671bf6b1ba83d01d3902813b566eed`. [Run de promoção](https://github.com/contaos999999/contaos-hml-control/actions/runs/45744991051)

As revisões foram assistidas pela conta Edivan5002 conforme a PR #781. [Material 6067826851](https://github.com/contaos999999/contaos-hml-control/pull/790#pullrequestreview-6067826851) · [Atestação 6067888121](https://github.com/contaos999999/contaos-hml-control/pull/792#pullrequestreview-6067888121) · [Promoção 6067913750](https://github.com/contaos999999/contaos-hml-control/pull/793#pullrequestreview-6067913750)

## Escopo e próxima etapa

A prova usa adaptadores reais de frontend, identidades e transporte sintéticos. LIVE permanece **NOT_RUN**. O GATE PROD permanece **NO-GO**. A próxima etapa prevista é o PLAN próprio da F6 CODE após eficácia da certificação.

[Manifesto](F5_CODE_CERTIFICATION.json) · [Ledger](F5_CODE_ATTESTATION_CANDIDATE.json) · [Recibo](F5_CODE_PROMOTION_RECEIPT.json) · [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708)

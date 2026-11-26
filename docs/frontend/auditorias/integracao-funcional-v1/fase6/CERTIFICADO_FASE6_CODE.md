# Certificado oficial da Fase 6 CODE

**ContaOS 4.1 · Integração Funcional V1**

**Data** 26 de novembro de 2026

**Resultado** `IFV1_F6_CODE=PASS` no escopo `CODE_FIXTURE`

A certificação entra em vigor após CI aprovado, revisão técnica assistida no HEAD desta PR documental, merge protegido e confirmação da leitura dos arquivos na `main`.

## Cobertura material

| Medida | Resultado |
| --- | ---: |
| Casos canônicos executados | 138 de 138 |
| Obrigatórios | 120 de 120 |
| Condicionais aplicáveis | 18 de 18 |
| Provas positivas | 138 |
| Provas negativas | 138 |
| Total de provas canônicas | 276 |
| Jornadas complementares | 4 |
| Provas complementares | 8 |
| Falhas, bloqueios, omissões, skips e N/A | 0 |

Foram integradas as PRs [#798](https://github.com/contaos999999/contaos-hml-control/pull/798), [#800](https://github.com/contaos999999/contaos-hml-control/pull/800), [#802](https://github.com/contaos999999/contaos-hml-control/pull/802), [#804](https://github.com/contaos999999/contaos-hml-control/pull/804), [#806](https://github.com/contaos999999/contaos-hml-control/pull/806), [#808](https://github.com/contaos999999/contaos-hml-control/pull/808) e [#810](https://github.com/contaos999999/contaos-hml-control/pull/810). A prova cumulativa foi executada no HEAD `4e18a39c12e55f7816a1a7501685a683d126d9d9`, árvore `840423b1b406ae82dfb195234b2c34d3144334f5`, merge `66d3238a17134d02d25285826a7c78820e9724d7`. O [run material 45780848238](https://github.com/contaos999999/contaos-hml-control/actions/runs/45780848238), tentativa 1, gerou onze ZIPs nativos. Os sete workflows passaram. O [Teste C](https://github.com/contaos999999/contaos-hml-control/actions/runs/45780848318) gerou 329 capturas para 390, 768, 1280 e 1440 px e temas claro e escuro. O manifesto registra o artefato, a tentativa e o hash conferidos.

## Atestação e promoção

A [atestação #812](https://github.com/contaos999999/contaos-hml-control/pull/812) reproduziu os artefatos originais, incluindo a proveniência de jobs, tentativas, hashes, árvore e revisão. O [run 45813773150](https://github.com/contaos999999/contaos-hml-control/actions/runs/45813773150) publicou o candidato oficial no artefato 15114378138.

A [promoção #813](https://github.com/contaos999999/contaos-hml-control/pull/813) comparou byte a byte o candidato oficial, a reprodução e o ledger versionado. O ledger está na `main` com blob `2c4c5dff1a6b3d5ffdbaae5e51222ceafd07cb40` e SHA-256 `c3a5020fa9ce839dd594b6d72b7120fbce111463b9bd5ee39defc0f5558a95b1`. O [run 45814318556](https://github.com/contaos999999/contaos-hml-control/actions/runs/45814318556) publicou o recibo 15114646189, com SHA-256 `1acaaaf82c59214cbd44e86f34731c257bb47a0fd0600ec23a2773b927ac8c27`.

As revisões foram registradas por Edivan5002 na modalidade técnica assistida prevista pela [PR #781](https://github.com/contaos999999/contaos-hml-control/pull/781). [Material 6073558312](https://github.com/contaos999999/contaos-hml-control/pull/810#pullrequestreview-6073558312) · [Atestação 6073641956](https://github.com/contaos999999/contaos-hml-control/pull/812#pullrequestreview-6073641956) · [Promoção 6073690283](https://github.com/contaos999999/contaos-hml-control/pull/813#pullrequestreview-6073690283).

## Escopo e continuidade

Adaptadores do frontend foram exercitados com dados, identidades e transporte sintéticos. Backend normativo `a1516de1d8949e505d83b5e000eb1cc558b217a7`. Blob protegido de tipos `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. LIVE `NOT_RUN`. PROD `NO-GO`. A próxima etapa é a Fase 7 CODE, com plano próprio.

[Manifesto](F6_CODE_CERTIFICATION.json) · [Recibo](F6_CODE_PROMOTION_RECEIPT.json) · [Ledger](F6_CODE_ATTESTATION_CANDIDATE.json) · [SHA256SUMS](SHA256SUMS) · [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708)

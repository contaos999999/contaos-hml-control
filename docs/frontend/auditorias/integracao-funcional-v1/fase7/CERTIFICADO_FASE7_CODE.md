# Certificado da Fase 7 CODE

**ContaOS 4.1 · Integração Funcional V1**

**Data** 26 de novembro de 2026

**Resultado** `IFV1_F7_CODE=PASS`. A certificação da integração funcional V1 no escopo CODE tem eficácia após CI, revisão técnica assistida, merge protegido e leitura dos arquivos deste certificado na `main`.

## Cadeia verificada

| Fase | PR de certificação | Prova reconciliada |
| --- | --- | --- |
| 1 | [#594](https://github.com/contaos999999/contaos-hml-control/pull/594) | Inventário estático reproduzido. 29 superfícies, 577 relações e 812 pares. |
| 2 | [#652](https://github.com/contaos999999/contaos-hml-control/pull/652) | 52 casos autenticados no snapshot e deployment históricos. |
| 3 | [#758](https://github.com/contaos999999/contaos-hml-control/pull/758) | 138 pares de provas de cadastros e conexões. |
| 4 | [#776](https://github.com/contaos999999/contaos-hml-control/pull/776) | 138 pares de provas de CRUD e sincronização. |
| 5 | [#795](https://github.com/contaos999999/contaos-hml-control/pull/795) | 138 pares de provas de autorização e isolamento em fixtures. |
| 6 | [#815](https://github.com/contaos999999/contaos-hml-control/pull/815) | 138 pares de provas de jornadas integradas e oito provas complementares. |

A matriz associa cada uma das 138 conexões à superfície, ao invariante, aos casos, aos artefatos e ao certificado. A reconciliação abrangeu 45 execuções, 48 artefatos nativos e dez arquivos originais conferidos byte a byte. Preservou os 51 resultados históricos admitidos na R10 e o fechamento R14 da Fase 2, com a conclusão original de cada execução. O recibo histórico documenta a revisão e a integração da F1. As demais revisões de certificação foram confirmadas no HEAD correspondente.

## Execução e validade

A [PR #816](https://github.com/contaos999999/contaos-hml-control/pull/816), HEAD `ed01f5bebead913bf0bf66b1933418b400df85cc`, árvore `1ac4473437b7c0a203aebf5da998123791be951e`, merge protegido `badffc1e3381e85bd115c04dfc98bb5fc864972b`, passou pelo PLAN #817 e pela [revisão assistida 6073905992](https://github.com/contaos999999/contaos-hml-control/pull/816#pullrequestreview-6073905992) de Edivan5002, conforme #781. O [run 45816836888](https://github.com/contaos999999/contaos-hml-control/actions/runs/45816836888), tentativa 1, publicou o recibo no artefato 15115892489. O SHA-256 do recibo é `e866606f09d4abddb77d3a07c62132fbf5489cc1c7a8f458a136e83f473a8cbb`. O SHA-256 da matriz é `79336321adcce1d408bce2841d7e46403014fe107772d348b537314db573bb21`.

LIVE `NOT_RUN` e PROD `NO-GO`. Permanecem R-01, R-02 e R-03 nos escopos históricos aceitos. A Fase 8 consolida o resultado CODE com o certificado histórico da V1, preservando seus arquivos e limites.

[Manifesto](F7_CODE_CERTIFICATION.json) · [Recibo](F7_CODE_RECONCILIATION_RECEIPT.json) · [Matriz](F7_CODE_TRACEABILITY.json) · [SHA256SUMS](SHA256SUMS)

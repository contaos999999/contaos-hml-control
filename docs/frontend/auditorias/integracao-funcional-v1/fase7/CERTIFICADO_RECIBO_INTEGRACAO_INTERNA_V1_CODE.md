# Certificado de integração interna da V1 CODE para o P0

Em 26/11/2026, a certificação [V1 Integração Funcional CODE](https://github.com/contaos999999/contaos-hml-control/pull/821) está integrada no merge `b3b7f09765d56340f440c8df94cfbd9a692d3023`, após a [certificação F7 CODE](https://github.com/contaos999999/contaos-hml-control/pull/818). Esta prova final liga ao P0 os certificados, a matriz de rastreabilidade e o grafo da V1. O recibo se torna efetivo com o merge protegido da PR #822 e a autenticação pelo gate de proveniência na `main`.

## Cobertura certificada

- 138 conexões canônicas de dados e auditoria entre as 27 telas do núcleo, com 120 casos obrigatórios, 18 condicionais aplicáveis e 276 provas positivas e negativas por fase de execução. A cadeia F3–F6 totaliza 1.104 provas, mais oito provas complementares da F6.
- 52 casos históricos de navegação autenticada na F2. O inventário F1 tem 29 superfícies, incluindo duas auxiliares de recuperação, 577 conexões estáticas e 812 pares direcionados.
- 488 critérios históricos reconciliados na F8, com 473 decisões PASS_REAL, 15 aceites da mesma ressalva R-03 e zero critérios sem decisão.

| Artefato | SHA-256 |
| --- | --- |
| [Matriz de rastreabilidade F7](F7_CODE_TRACEABILITY.json) | `79336321adcce1d408bce2841d7e46403014fe107772d348b537314db573bb21` |
| [Grafo de conexões](../fase1/GRAFO.mmd) | `e16020d742049facc0c71492331858f2c513e2cc51f2b71b3a46c3df46d7d0da` |
| [Inventário do grafo](../fase1/inventario.json) | `81f56088977b9d874c2e2a3678a1df185dcccf0e0f16b99629fb2862f411d302` |
| [Manifesto global CODE](../fase8/V1_INTEGRACAO_FUNCIONAL_CODE_CERTIFICATION.json) | `82ade19f490c43ed597b413b32eb02964e8b41178f1f11942b8455783bca593d` |

## Cadeia de evidências

| Fase | Certificado e revisão | CI de proveniência |
| --- | --- | --- |
| F1 | [Certificado original #594](https://github.com/contaos999999/contaos-hml-control/pull/594), reexecutado e [revisado na #816](https://github.com/contaos999999/contaos-hml-control/pull/816#pullrequestreview-6073905992) | [Zero-Drift 45816836250](https://github.com/contaos999999/contaos-hml-control/actions/runs/45816836250) e [reprodução 45816836888](https://github.com/contaos999999/contaos-hml-control/actions/runs/45816836888) |
| F2 | [#652, revisão 5898772537](https://github.com/contaos999999/contaos-hml-control/pull/652#pullrequestreview-5898772537) | [Zero-Drift 43512971085](https://github.com/contaos999999/contaos-hml-control/actions/runs/43512971085) |
| F3 | [#758, revisão 6051192764](https://github.com/contaos999999/contaos-hml-control/pull/758#pullrequestreview-6051192764) | [Zero-Drift 45536602285](https://github.com/contaos999999/contaos-hml-control/actions/runs/45536602285) |
| F4 | [#776, revisão 6055575595](https://github.com/contaos999999/contaos-hml-control/pull/776#pullrequestreview-6055575595) | [Zero-Drift 45591946451](https://github.com/contaos999999/contaos-hml-control/actions/runs/45591946451) |
| F5 | [#795, revisão 6067937617](https://github.com/contaos999999/contaos-hml-control/pull/795#pullrequestreview-6067937617) | [Zero-Drift 45745384585](https://github.com/contaos999999/contaos-hml-control/actions/runs/45745384585) |
| F6 | [#815, revisão 6073743148](https://github.com/contaos999999/contaos-hml-control/pull/815#pullrequestreview-6073743148) | [Zero-Drift 45814865584](https://github.com/contaos999999/contaos-hml-control/actions/runs/45814865584) |

O Teste C da [PR #823](https://github.com/contaos999999/contaos-hml-control/pull/823) elabora a evidência visual no HEAD exato, com Playwright em quatro larguras e dois temas, capturas verificáveis e checkout somente leitura. O recibo ativo identifica o run, a tentativa, o artefato e o SHA-256. Revisão técnica assistida por Edivan5002, de acordo com a [PR #781](https://github.com/contaos999999/contaos-hml-control/pull/781).

## Ressalvas autorizadas para o GATE PROD após a V5

- R-01. Upload físico e limites de tamanho, interrupção e retomada.
- R-02. Worker e filas reais.
- R-03. Isolamento real entre usuários e organizações.

As provas da integração CODE foram executadas com os adaptadores reais do frontend e dados, identidades e transporte sintéticos nas fases CODE_FIXTURE. A validação visual usa o perfil do Teste C. LIVE `NOT_RUN`. PROD `NO-GO`. Regra de execução das contraprovas [PR #718](https://github.com/contaos999999/contaos-hml-control/pull/718).

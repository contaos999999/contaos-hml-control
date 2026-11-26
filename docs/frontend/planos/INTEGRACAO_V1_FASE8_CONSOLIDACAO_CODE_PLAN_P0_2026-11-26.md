# PLAN P0 da Fase 8 de consolidação CODE da V1

**ContaOS 4.1 · Integração Funcional V1**

Certificado F7 CODE [#818](https://github.com/contaos999999/contaos-hml-control/pull/818) efetivo na `main` em `f4395961bc7ccf2d66260ea61c97befa4e6f29f2`. A integração funcional segue as sete fases do plano mestre #653. A presente Fase 8 atende à solicitação do titular de consolidar essa cadeia com a certificação histórica da V1 [#591](https://github.com/contaos999999/contaos-hml-control/pull/591), cujos escopo, ressalvas e arquivos permanecem íntegros.

## Critérios de aceite

- Conferir a Fase 7 CODE efetiva e seu recibo original. Validar os sete certificados da cadeia de Integração Funcional V1, os hashes, o merge, a revisão, o CI e o readback.
- Reconciliar a Fase 8 histórica #591 e os sete checkpoints do GATE backend #138 com o certificado atual de integração. Validar origem, árvore e CI histórico, sem converter prova histórica em execução nova.
- Comparar 488 chaves e textos com o inventário P0 atual, composto por 416 critérios legados e 72 normalizados. Preservar 473 registros PASS_REAL históricos e 15 aceitações históricas R-03. Verificar os 45 regulares, 25 atômicos V1/BRAND e 12 NFR e seus limites.
- Confirmar as cinco mudanças de produto historicamente integradas até o baseline certificado de navegação da F2. Demonstrar a compatibilidade de produto da F2 com o HEAD auditado e preservar os blobs históricos, o backend normativo e LOCK-TYPES.
- Executar testes positivos e contraprovas de omissão, escopo, exceção ampliada, adulteração de hash, review ou proveniência. Publicar recibo de CI no HEAD exato e integrar certificado documental com revisão assistida Edivan5002, CI, merge protegido, SHA256SUMS e readback.
- Preservar as ressalvas R-01, R-02 e R-03 e sua incidência histórica. LIVE NOT_RUN nesta consolidação. PROD NO-GO. O certificado histórico e a sua matriz não serão reescritos.

## Caminhos exatos da BUILD #819

- `docs/frontend/auditorias/integracao-funcional-v1/fase8/F8_CODE_SOURCES.json`
- `scripts/hml/integracao-v1-fase8-code-close.mjs`
- `scripts/hml/integracao-v1-fase8-code-close.test.mjs`
- `.github/workflows/contaos-f8-code-close.yml`

## Caminhos do certificado documental

- `docs/frontend/auditorias/integracao-funcional-v1/fase8/F8_CODE_CONSOLIDATION_RECEIPT.json`
- `docs/frontend/auditorias/integracao-funcional-v1/fase8/V1_INTEGRACAO_FUNCIONAL_CODE_CERTIFICATION.json`
- `docs/frontend/auditorias/integracao-funcional-v1/fase8/CERTIFICADO_INTEGRACAO_FUNCIONAL_V1_CODE.md`
- `docs/frontend/auditorias/integracao-funcional-v1/fase8/SHA256SUMS`

Em caso de divergência, bloquear a certificação, preservar os recibos históricos e registrar a causa na issue #708 antes de nova execução. A reversão segue PR protegida.

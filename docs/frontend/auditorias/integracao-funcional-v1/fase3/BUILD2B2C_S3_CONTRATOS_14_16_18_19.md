# F3 S3 · Contratos de mutação sem upload, produtores 14, 16, 18 e 19

**Origem da missão:** issue #708, catálogo F3_CASES 138 relações. **Norma:** PR #722 separa certificação CODE e GATE PROD LIVE. **Base:** main após o merge #727 (3989f39c39c038820fb1ff4d1161804aa443cf0c).

## Escopo deste incremento

Estender a declaração real de fluxo da cerca F3 em `integracao-v1-fase3.mjs`, sem tocar produto, backend, RLS, Storage, credenciais ou PROD. Respeitar F3_FLUXOS_PRODUTORES §3:

- **Produtor 14 V113:** RPC `criar_competencia`, contrato F3 inventariado (7), período gerado pela UI, sem chave de reenvio.
- **Produtor 16 V116:** RPC `solicitar_analise_competencia`, competência (14) inventariada, sem chave de reenvio.
- **Produtor 18 V118:** prerequisito `solicitar_parecer_interno` vinculado à competência (14) e principal `aprovar_parecer_interno` vinculado ao parecer observado do prerequisito, sem reenvio.
- **Produtor 19 V119:** prerequisito `aprovar_apresentacao` vinculado à competência (14) sem reenvio e principal `registrar_apresentacao` com chave de idempotência gerada pela UI.

**Proteções:** cada posição `inventory` só aceita identificadores inventariados por produtor e ação; a cerca falha fechada para entidade ausente ou de outra organização. Os testes negativos do R3 são estendidos para cobrir as 18 posições tipadas declaradas. Os testes de correspondência de fonte importam os módulos reais de produto e conferem as chamadas RPC, sem substituir a implementação.

## Evidência, interpretação e limites

A aprovação do CI desta PR comprovará somente a consistência desses quatro contratos e as negativas no livro/cerca em código. **Não** comprova integração entre telas, execução dos 138 casos nem segurança LIVE HML. Nenhum caso do `F3_CODE_COVERAGE_MATRIX.json` muda de `NOT_RUN` sem teste de comportamento por caseId, recibo vinculando HEAD/job/hash e validação independente. O `F3_CODE_EVIDENCE_LEDGER.json` e `F3_LEDGER.json` ficam inalterados e vazios. Fase 4 permanece NO-GO.

**Trabalho seguinte:** implementar e exercitar drivers de UI e consumidores para V113/V116/V118/V119, contratos de upload dos produtores 9, 12, 13, 15, 20 e fluxos 11/17, e depois executar casos por produtor e consumidor conforme emenda CODE.

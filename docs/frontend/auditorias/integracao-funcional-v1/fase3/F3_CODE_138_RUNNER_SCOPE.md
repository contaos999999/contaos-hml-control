# F3 CODE 138 — execução e bloqueios individualizados

**Missão:** F3-138-CODE-CERTIFICATION; fonte: `F3_CASES.json` e matriz congelada de 138 ligações.

Este BUILD acrescentará um runner separado para percorrer todos os 138 `caseId`, com registro por caso e código de saída não-zero se houver casos sem evidência. Nenhuma prova funcional será criada a partir de referência de fonte, teste de infraestrutura ou recibo sintético. Os testes do runner serão unitários; contraprovas HML LIVE não serão antecipadas antes do GATE PROD.

O runner distinguirá claramente: `NOT_EXECUTED`, `BLOCKED_DRIVER`, `FAIL` e `EVIDENCE_SUBMITTED_UNVERIFIED`, sem qualquer `PASS` funcional na ausência de execução real com atestação verificável. O relatório JSON/CSV será publicado como artefato de `workflow_dispatch`, sem gravar o ledger canônico. O workflow de execução retornará exit 1 enquanto qualquer caso obrigatório estiver bloqueado. Os contratos e drivers existentes permanecem intactos.

O escopo de código será fechado em PLAN P0 protegido prévio, integrado à main antes de editar scripts/workflows. A matriz 138, os ledgers F3 e o backend são imutáveis neste BUILD.

**Status:** planejamento de escopo para execução, não certificação. Os 138 casos permanecem sem provas CODE de produto até a realização dos testes reais.

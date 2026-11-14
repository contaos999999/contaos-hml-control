# P0-NR-001 — Emenda causal: teste não pode depender de status mutável do ledger
**Data:** 14/11/2026. **Origem:** PR #667, check P0-NR run `43588595498` FAIL no HEAD `6ada52fcc3049893e3334f28571b9fc76a944e79`; PLAN antes de alterar `scripts/p0-nr001-gate.test.mjs`. **Status:** PLAN DOCUMENTAL, eficácia sujeita a CI, review independente e merge protegido.

## Causa raiz confirmada
O teste `P0 NR — PR pendente pode propor novo teste, jamais implica certificado` escolhe o incidente **real NR-003** do ledger e afirma que seu status deve ser permanentemente `PENDENTE_PR`. Após merge técnico #661 (commit main `3e8f76c7cbe5741d8de024ea6e9921fab37db02f`, CI push Zero-Drift `43588310817`, LOCK `43588310812`, P0-NR `43588310801`, revisão APPROVED `5903985490`), a mudança legítima do ledger NR-003 para `EM_MONITORAMENTO` faz o teste falhar, sem quebrar qualquer requisito real. O teste acoplou sua fixture a dado operacional mutável, contrariando o objetivo de prevenir repetição de falhas. Não mascarar a alteração do ledger para satisfazer o teste.

## Solução completa e escopo
- O teste deve clonar o ledger e **construir explicitamente** um cenário sintético de `PENDENTE_PR`, com `recibo:null` e `origem` com PR real/sintética válida para a regra; então validar que `validateLedger` aceita esse estado sem o confundir com `RESOLVIDO_COM_PROVA`.
- Adicionar negativo: uma entrada `PENDENTE_PR` com recibo antecipado = FAIL, independentemente do status atual da NR-003.
- Adicionar positivo: a NR-003 pode evoluir a `EM_MONITORAMENTO` com o teste preventivo efetivamente presente na main e `recibo:null`, sem exigir alegação de resolução.
- **Allowlist do BUILD #667:** `docs/frontend/governanca/P0_NR_001_LEDGER.json` (já alterado) e `scripts/p0-nr001-gate.test.mjs` (corrigir teste e acrescentar negativos); nenhuma mudança no script guard, workflow, `src/`, backend, tipos, Auth, RLS ou PROD.
- A PR #667, agora de ledger+teste, deve preservar o PLAN #664 aprovado, este PLAN, as 8 classes históricas e a proibição de marcar `RESOLVIDO_COM_PROVA` sem REST autêntico.

## Critérios de aceite
Reprodução RED nativa na run `43588595498` no HEAD `6ada52...`. GREEN deve executar o teste causal e **todos** os testes negativos do P0-NR no novo SHA, mais Zero-Drift e LOCK do mesmo HEAD; Teste C Playwright SKIPPED é legítimo por diff não visual, não prova E2E. Revisão separada Edivan5002, merge protegido e readback de ledger e teste; não reabrir fases concluídas nem produção.

**P0-NR-001:** cenário operacional mutável não pode ser fixado no teste de contrato; prevenir reincidência com fixture sintética e negativos, nunca com hardcode de status histórico. **ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO).**

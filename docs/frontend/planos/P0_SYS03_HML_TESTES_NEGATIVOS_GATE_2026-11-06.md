# P0 SYS-03 — GATE independente de provas HML (2026-11-06)

PLAN canônico integrado: PR #194, merge 90ac5c6356b254c7fe2b0c3f4fde03cff9546efe. Este GATE é **documental**, não certificação nem autorização de alteração de Supabase.

## Decisão
BUILD de harness E2E fica condicionado a evidências objetivas. Sem fixture sintética e mailbox automatizável isoladas, os cenários N1/N2/N3/N5/N8/N9 permanecem BLOCKED. N4 e N6 podem ser testados com controles de segurança; N7 só após orçamento de requisições e cooldown aprovados. Nunca usar conta pessoal ou quarentenada.

## Critérios obrigatórios antes do BUILD
- Conferir escopo com PRD, premissas, arquitetura, prompts atômicos e RNFs, Brand, Zero-Drift e requisitos transversais V1. Não renumerar prompts nem passar para V2.
- Fonte canônica backend e HEAD registrados no momento da execução; RLS e auth Supabase HML são autoridade. Não alterar backend, PROD, migrations ou configuração global.
- Ambiente de execução isolado com aprovação, mailbox controlada, dados sintéticos, segredos mascarados e limpeza comprovável.
- Testes TDD RED, GREEN, Teste C independente, checks obrigatórios e auditoria WCAG/visual conforme escopo.
- Cada prova N1-N9 deve registrar UTC, SHA, ambiente, esperado, observado, PASS/FAIL/BLOCKED, logs sanitizados e cleanup.
- Rate limit: não fazer rajadas, brute force nem gerar bloqueio de usuários reais. Sem fixture e limite explícito, N7 BLOCKED.
- Expiração temporal: não inferir de hash artificial; exigir evidência real ou ambiente descartável com relógio controlado.
- Sessões anteriores: comparar com política efetiva; não presumir revogação de todas as sessões por signOut local.

## Saídas do GATE
PLAN integrado PASS; prova real N1-N9 PENDENTE; fixture/mailbox BLOCKED até provisionamento; Teste C E2E PENDENTE. Este documento só autoriza preparação de testes **não destrutivos** e implementação posterior condicionada à validação canônica. Nenhum PASS presumido.

## Próxima ação
Submeter este GATE aos dois checks canônicos no mesmo HEAD, integrar após SUCCESS e iniciar TDD em PR separado. Preservar checkpoint issue #166.

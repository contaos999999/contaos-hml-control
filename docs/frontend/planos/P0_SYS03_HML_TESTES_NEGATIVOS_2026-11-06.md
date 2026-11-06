# P0 SYS-03: plano de testes negativos HML — 2026-11-06

Baseline frontend: d83dca9d59952a53632163c1b281202475cc5f49. Supabase HML: gklhhhyosgasnyoxlrui. Proibidas mudanças em PROD, RLS, migrações e Auth global.

## Evidências
Operador relatou e-mail recebido, redirecionamento corrigido, troca efetiva de senha, login, rejeição do link consumido, rejeição de senha fraca e mensagem neutra para e-mail inexistente. Evidências manuais documentadas na issue #166. Não equivalem a teste independente.

## Pré-condições
Fixture sintética isolada e mailbox controlada, sem contas pessoais ou quarentenadas; ambiente GitHub hml-e2e protegido; aprovação e autorização de fixture; redirecionamento HML conferido; sanitização de logs; limite de tentativas, cooldown e cleanup. Sem fixture ou inbox automatizável, marcar BLOCKED, não simular PASS.

## Matriz de prova
N1 recuperação e login real.
N2 rejeição de token consumido.
N3 expiração temporal real, sem mock como evidência.
N4 token ausente ou malformado, sem sessão.
N5 senha fraca rejeitada no servidor.
N6 resposta neutra para e-mail inexistente.
N7 rate limiting controlado com orçamento de requisições, sem carga no Auth compartilhado.
N8 comportamento de sessões anteriores conforme política documentada, usando duas sessões sintéticas.
N9 Test C independente e evidências sanitizadas.

## Aceite
Cada caso exige timestamp UTC, HEAD, HML, esperado, observado, PASS/FAIL/BLOCKED, evidência verificável, cleanup. Nunca expor tokens, links, senhas ou PII. Manter gates canônicos PLAN → dois checks SUCCESS no mesmo HEAD → merge → GATE separado → TDD RED → BUILD → GREEN → Test C → auditoria visual → checkpoint. Não certificar SYS-03 nem V1 sem todas as provas.

## Próxima tarefa
Validar este PLAN em CI, integrar somente após checks, criar GATE independente e preparar harness de provas reais em PR posterior.
# P0 V1 — GATE de prova real SYS-03 (recuperação de senha)

Estado: **PLAN proposto, NÃO executado nem certificado**. Base frontend `f047c28e47437b504cf6d6c65e10ad19ea2231dc`. Não usar PROD.

## Contrato observado
- `src/routes/esqueci-senha.tsx` usa `ForgotPasswordForm`; `src/test/forgotPassword.test.tsx` cobre mocks de `resetPasswordForEmail`, neutralidade de mensagens, rate limit e redirect `/redefinir-senha`.
- `src/routes/redefinir-senha.tsx` usa `ResetPasswordForm`; `src/test/resetPassword.test.tsx` cobre mocks de `PASSWORD_RECOVERY`, bloqueio de `SIGNED_IN` comum, expiração e `updateUser`.
- Esses testes unitários **não provam** entrega de email, consumo de token real, expiração/reuso nem login após troca no Auth HML.

## Pré-condições obrigatórias
1. Confirmar projeto Supabase **HML** `gklhhhyosgasnyoxlrui` por identificador e URL, nunca PROD. Não imprimir tokens, URLs contendo `code`, OTP, senhas, cabeçalhos ou cookies.
2. Criar **nova** identidade sintética isolada, e-mail alias controlado e caixa de entrada de teste com acesso autorizado; não reutilizar 56 contas em quarentena. Limitar rate, garantir cleanup e logar apenas IDs pseudonimizados.
3. Configurar URL de redirect de HML explicitamente permitida e validar domínio; armazenar segredos somente em Actions secrets/environment HML, com masking.
4. Teste C independente do autor do BUILD, com artefatos expurgados de credenciais e validade curta. Sem mailbox controlada, registrar BLOCKED, jamais PASS simulado.

## Matriz de execução real (cada caso com run/job, HEAD, timestamp e assert)
| ID | Cenário | Evidência esperada |
| --- | --- | --- |
| SYS03-E2E-01 | Solicitação com alias sintético existente | chamada aceita e mensagem neutra; mensagem efetivamente recebida na caixa de teste |
| SYS03-E2E-02 | Abrir link original uma vez | `PASSWORD_RECOVERY` válido, formulário acessível, nova senha aceita pelo Auth HML |
| SYS03-E2E-03 | Reutilizar link consumido em sessão limpa | link rejeitado; nenhuma troca de senha permitida |
| SYS03-E2E-04 | Link expirado em sessão limpa | rejeição confirmada pelo servidor, não apenas mock de hash |
| SYS03-E2E-05 | Login com senha nova e antiga | nova aceita, antiga recusada, sign-out/session invalidation conforme contrato |
| SYS03-E2E-06 | Usuário inexistente | resposta neutra sem enumeração; nenhum email entregue |
| SYS03-E2E-07 | Sessão SIGNED_IN comum sem recuperação | redefinição bloqueada no cliente e no fluxo real |
| SYS03-E2E-08 | Rate limit e concorrência | sem envio duplicado nem vazamento de existência; respeitar limite do HML |

## Gates de aceite
- PLAN, GATE separado, TDD RED quando aplicável, BUILD, GREEN, Teste C e auditoria visual permanecem etapas distintas; checks obrigatórios devem ser SUCCESS no **mesmo HEAD** antes de merge.
- Reexecutar Vitest e Playwright em 1440/1280/768/390, claro/escuro, teclado, foco, contraste e WCAG 2.2 AA aplicável. Não declarar prova visual se job foi skipped.
- Registrar evidências individuais em checkpoint oficial, incluindo falhas e cleanup, sem alterar BRAND-01 ou fontes canônicas. Nenhuma promoção V2/PROD.

## Limitação atual
Este arquivo define o gate executável a implementar; **nenhum dos oito cenários foi executado por este PR**. Não equivale à certificação SYS-03 ou V1.

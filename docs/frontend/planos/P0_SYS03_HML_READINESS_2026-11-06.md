# SYS-03 P0 — Verificação de prontidão HML (2026-11-06)

## Evidências observadas
- Frontend main: `237e509fa24afd4a36c128634b6c9bc60af6afee`, PR #200 integrado, checks Zero-Drift e Teste C SUCCESS no run 42189454204.
- Supabase HML: projeto `gklhhhyosgasnyoxlrui`, região `us-east-1`, estado `ACTIVE_HEALTHY` na consulta de projeto.
- Consulta SQL de leitura agregada a `auth.users`: **59 usuários totais** e **0 usuários** com padrão sintético reservado `contaos-sys03-%@example.invalid`. Esse padrão é apenas uma convenção de sondagem, não prova de ausência de outras contas de teste.
- Não foi disponibilizada nesta rodada uma mailbox sintética controlada, nem sessão de recuperação e token verificável. Nenhum envio de e-mail ou mudança de senha foi feito.

## Matriz de prova real
| Caso | Estado | Evidência exigida |
|---|---|---|
| N1 recuperação e login novo | BLOCKED | Fixture + mailbox + login real |
| N2 reutilização de token | BLOCKED | Token consumido real |
| N3 expiração temporal | BLOCKED | TTL real e relógio verificável |
| N4 token ausente/malformado | PENDENTE | Navegador independente com URL segura |
| N5 senha fraca no Auth | BLOCKED | Sessão sintética real + rejeição server-side |
| N6 resposta neutra a e-mail inexistente | PENDENTE | Chamada controlada sem conta real |
| N7 rate limit | BLOCKED | Orçamento e cooldown aprovados, sem flood |
| N8 sessões anteriores | BLOCKED | Duas sessões sintéticas + política documentada |
| N9 Teste C autenticado | BLOCKED | Executor independente e fixture |

## Próximo gate
Criar conta sintética com caixa de e-mail realmente acessível, isolada e descartável, e documentar a política de TTL e sessão sem registrar tokens, senhas ou endereços pessoais. Executar N4/N6 em ambiente HML com escopo limitado e evidência sanitizada. N7 não autoriza volume de requisições que impacte usuários reais. Exigir logs com timestamp UTC, HEAD, execução, hashes de evidência e cleanup. Nenhum PASS pode ser atribuído sem execução.

**Este relatório é prontidão, não certificação de SYS-03 nem da V1.**

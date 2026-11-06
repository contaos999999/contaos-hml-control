# P0 SYS-03 — auditoria de execução HML e lacuna de harness (2026-11-06)

## Verificação no HEAD `a5dd78dc67fee4db3815f383587694d1a0298a1a`
- PR #200: testes unitários de recuperação de senha com Supabase mock e correção de tokens inválidos, ambos checks CI SUCCESS.
- PR #201: prontidão HML documentada e integrada, sem prova E2E.
- `package.json`: script `test` executa `vitest run`; **não há dependência Playwright** declarada.
- `playwright.config.ts`: não encontrado.
- `tests/hml/sys03-negative.spec.ts`: não encontrado.
- `src/test/resetPassword.test.tsx`: contém casos de hash otp_expired, sessão comum bloqueada, PASSWORD_RECOVERY, weak_password simulado, duplo envio, erros 422 e rede.
- Projeto Supabase HML consultado: ACTIVE_HEALTHY; consulta Auth agregada anterior com 59 usuários e 0 no padrão sintético sondado.

## Implicação
O check intitulado “Teste C Independente” que passou no PR #200 **não equivale automaticamente** à execução autenticada N1–N9. Sem executor de navegador instalado/configurado, mailbox sintética e credenciais efêmeras em secrets HML, não é correto reportar N1–N9 como PASS.

## Execução proposta, sem enfraquecer gates
1. Autorizar em gate próprio os arquivos de configuração/lockfile do runner E2E, mantendo versões fixas e auditando supply chain; não instalar dependências antes do gate.
2. Configurar fixture sintética em mailbox controlada e secrets de ambiente HML sem registrar tokens, senhas ou PII.
3. Implementar testes isolados de N4 (URL ausente/malformada) e N6 (resposta neutra), com evidência sanitizada; não bombardear rate limit.
4. Implementar N1/N2/N3/N5/N8 com usuários e sessões sintéticos, cleanup e TTL medido; N7 somente com orçamento aprovado.
5. Executar N9 por executor independente, registrar run/HEAD/hash; fechar SYS-03 apenas após critérios reais aprovados.

**Estado:** lacuna de infraestrutura E2E identificada, sem certificação SYS-03/V1. Nenhuma mudança de Auth, banco, PROD ou contas de usuários nesta auditoria.

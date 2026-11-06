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

## Atualização comprovada: Playwright público HML, 06/11/2026

- Run canônico: https://github.com/contaos999999/contaos-hml-control/actions/runs/42199114065
- Commit main testado: `fdceac92b177771f9f3ef44d9f4b59e174f706cf`.
- Runner Ubuntu 24.04; `bun install --frozen-lockfile` SUCCESS; Chromium Playwright 1.58.2 instalado SUCCESS.
- Job `127829716039`, resultado SUCCESS: **3/3 testes Playwright aprovados (10,4 s)**.
- N4: acesso direto a `/redefinir-senha` sem token não exibe formulário de nova senha: PASS.
- N4: hash `error_code=otp_expired` não exibe formulário: PASS.
- Página pública `/esqueci-senha` acessível e botão visível: PASS.
- A bateria não realiza solicitação de e-mail, login, atualização de senha, teste de sessão nem alteração de dados.
- **N1, N2, N3, N5, N6, N7, N8 e N9 seguem sem prova real E2E. N4 parcial, sem prova de token malformado contra o serviço.**
- Para completar testes autenticados, preparar conta sintética e mailbox sob controle HML, secrets efêmeros protegidos, cleanup e teste C independente. Nunca utilizar conta pessoal ou dados reais. N7 exige limite seguro de requisições.
- Não declarar SYS-03 ou V1 certificados com base em 3 testes públicos.

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

## Atualização da bateria pública ampliada — 06/11/2026

- Run: https://github.com/contaos999999/contaos-hml-control/actions/runs/42200526972
- HEAD testado: `fbdbf40f919ca43edca8c89ea48dc19a89154a29`.
- Resultado reportado nos registros da execução: **7/7 testes Playwright aprovados, 12,1 s**.
- Cenários: acesso sem token; token expirado no hash; página pública de recuperação; erro `otp_disabled`; erro `invalid_grant`; token expirado na query; erro genérico na query.
- Escopo: smoke público e testes negativos de URL. Não comprovam fluxo autenticado, entrega de e-mail, consumo real de token, sessão, rate limiting ou alteração de senha.
- N4 permanece **parcial**; N1–N3 e N5–N9 seguem pendentes de evidência E2E autenticada e independente.
- Próxima etapa: fixtures sintéticas HML, mailbox controlada, secrets protegidos, limpeza e execução N1–N9 com orçamento seguro para N7.
- **Não certificar SYS-03/V1** com base nesta bateria.


## Gate de prontidão para provas autenticadas HML (P0, sem execução de Auth)

**Escopo deste gate:** documentação e especificação verificável. Não autoriza provisionamento de usuário, envio de e-mail, uso de service_role, alteração de senha, SQL ou chamadas de autenticação.

**Pré-condições bloqueantes:**
1. Conta sintética exclusiva da homologação, identificada por prefixo controlado, sem e-mail pessoal ou dados de terceiros; mailbox de teste sob controle do projeto, com captura do link de recuperação e expurgo automático.
2. Segredos restritos ao environment `hml` do GitHub Actions, mascarados, sem exposição em artefatos/logs/PRs. URL e chaves devem apontar inequivocamente ao projeto Supabase HML esperado `gklhhhyosgasnyoxlrui`. Não usar PROD.
3. Fixture idempotente, organização de teste isolada, criação e cleanup garantidos mesmo em falhas; identificar IDs somente em artefatos sanitizados. Proibir exclusão de usuários preexistentes.
4. Runner independente com timeout por teste, limites de repetição, logs sanitizados, hashes de evidência e registro do SHA exato de frontend/backend.
5. Autorizar em emenda de `PLANO_ATIVO.json` os arquivos de implementação e workflow antes do BUILD. Aplicar PLAN -> gate CI -> RED -> BUILD -> GREEN -> Teste C independente -> merge.

**Matriz de aceite ainda pendente:**
- N1: solicitar e-mail sintético, consumir link uma vez, alterar senha e autenticar com a nova credencial.
- N2: reutilização do mesmo link rejeitada pelo serviço.
- N3: expiração real conforme TTL controlado e observado, sem simular relógio para afirmar comportamento do serviço.
- N4: token inválido/malformado validado também no serviço; sete casos públicos de URL já aprovados, mas não substituem esta prova.
- N5: senha fraca rejeitada pelo servidor, sem confiar apenas em validação da interface.
- N6: e-mail inexistente recebe mensagem neutra sem revelar existência da conta; nenhuma credencial real.
- N7: limitação de taxa apenas com orçamento explícito e baixo número de tentativas, respeitando políticas do provedor.
- N8: política de invalidação das sessões antigas comprovada com sessões sintéticas independentes.
- N9: Teste C autenticado executado por workflow independente e vinculado ao mesmo SHA, sem reutilizar somente o check de PR.

**Critério de interrupção:** falta de mailbox, credenciais HML, ambiente protegido, autorização de arquivos ou cleanup implica BLOCKED, nunca PASS. **SYS-03 e V1 permanecem não certificados.**

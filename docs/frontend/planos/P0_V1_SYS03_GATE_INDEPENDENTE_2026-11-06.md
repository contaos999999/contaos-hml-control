# P0 V1 SYS-03 — GATE independente do PLAN #187

Status: **GATE candidato, não aprovado nem executado**. Base `4243d0e896a98ad347bdeeca7557f6d05e457c67`. PLAN #187 integrado somente após dois checks SUCCESS no mesmo HEAD `d2e94b01287afb55584d85e2f95e23e4ba3d8dfd`. Não alterar PROD.

## Decisão de entrada
- Fonte: `docs/frontend/planos/P0_V1_SYS03_PROVA_REAL_GATE_2026-11-06.md`.
- Testes Vitest atuais de SYS-02 e SYS-03 usam mocks de Supabase. Não podem ser promovidos a evidência real HML.
- Nenhum alias de email ou caixa de entrada sintética foi confirmado nesta etapa. Não criar contas de teste sem garantir acesso e limpeza segura.

## Bloqueios objetivos antes de BUILD/prova real
1. Identificar uma caixa de email **controlada pelo ambiente de testes**, capaz de receber e inspecionar o link sem publicar token, URL de recuperação, senha ou OTP em logs/artifacts.
2. Validar configuração HML de redirect `/redefinir-senha` e projeto `gklhhhyosgasnyoxlrui`; não usar produção.
3. Preparar fixture nova, isolada, reversível, com registro pseudonimizado e cleanup verificável. Não reutilizar contas bloqueadas em quarentena.
4. Definir execução automatizada dos oito casos SYS03-E2E-01 a 08, incluindo link consumido/expirado, login com senha antiga/nova, sessão comum e rate limiting, com evidência server-side.
5. Definir Teste C independente e auditoria visual com autenticação, 1440/1280/768/390 e temas claro/escuro; verificar foco, teclado, contraste e WCAG 2.2 AA aplicável.

## Critérios de saída
- Todos os itens acima demonstrados por run/job/HEAD, com erros e ressalvas preservados. Dois checks obrigatórios SUCCESS no HEAD exato do PR antes de merge.
- GATE documental verde **não** é execução E2E nem certificação SYS-03/V1.
- Se faltar caixa controlada, redirect ou runner seguro, manter **BLOCKED**, documentar impedimento e avançar tarefas independentes V1.

## Próxima ação
Inspecionar ambiente de CI HML e capacidade de mailbox de teste, sem ler valores de secrets nem alterar Auth/PROD; só depois implementar prova real em branch BUILD e rodar Teste C.

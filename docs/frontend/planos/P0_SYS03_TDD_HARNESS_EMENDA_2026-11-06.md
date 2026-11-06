# P0 SYS-03 — emenda de escopo TDD e harness HML (2026-11-06)

## Motivação
PLAN #194 e GATE #195 integrados, mas `docs/frontend/planos/PLANO_ATIVO.json` ainda não inclui os arquivos SYS-03 na `arquivos_permitidos`. Alterar testes ou implementar harness sem emenda validada violaria Zero-Drift. Esta emenda **não executa BUILD** e não declara RED/GREEN.

## Arquivos propostos para próxima fase (ainda não autorizados)
- `src/test/forgotPassword.test.tsx`
- `src/test/resetPassword.test.tsx`
- `tests/hml/sys03-negative.spec.ts` (novo, somente se arquitetura de testes aprovada)
- `docs/frontend/auditorias/P0_SYS03_HML_E2E_RESULTADOS.md` (novo)
- `docs/frontend/planos/PLANO_ATIVO.json` (somente após revalidação canônica, para registrar a allowlist)

## Controles
Não alterar Auth global, Supabase backend, RLS, PROD, segredos, usuários pessoais/quarentenados. Fixture sintética, mailbox isolada e ambiente protegido são pré-condições reais. Evitar rate limit agressivo. Não expor token, senha, e-mail pessoal ou URL com parâmetros sensíveis. Exigir TDD RED antes de BUILD, GREEN, dois checks no mesmo HEAD e Teste C independente. Separar a aprovação desta emenda do BUILD.

## Critério de liberação
Conferir fonte canônica, RNFs, 100 prompts regulares e 97 atômicos, identidade visual e requisitos transversais V1; validar emenda em CI e integrar; só então alterar `PLANO_ATIVO.json` no gate apropriado e começar testes. Sem infraestrutura de e-mail sintética, registrar N1/N2/N3/N5/N8/N9 como BLOCKED, nunca PASS.

## Evidência de execução
Esta etapa apenas prepara a autorização documental do escopo e mantém a implementação bloqueada até os gates aplicáveis.

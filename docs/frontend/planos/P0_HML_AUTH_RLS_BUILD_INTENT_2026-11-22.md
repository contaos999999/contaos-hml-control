# BUILD INTENT — HML Auth/RLS, somente intenção; sem execução

Plano-fonte já integrado pela PR #703: `docs/frontend/planos/PLAN_P0_HML_AUTH_RLS_SHA_2026-11-22.md` em `main@807053affe2e495d3405672fcd55584f6ec050a7`.

Esta branch é criada **antes do BUILD** para determinar o número exato da PR. Ainda não implementa código, não testa credenciais, não altera banco, Auth, regras, CI, deploy ou PROD.

O BUILD deverá começar exclusivamente após: (1) manifesto `P0_GOV_PLAN_<PR>.json` fechado e integrado à `main`, vinculado à PR desta branch; (2) testes RED específicos, no HEAD ancestral; (3) validação da ausência de alterações na fonte canônica incompatíveis; (4) aprovação de escopo de HML.

Escopo previsto: pré-condições de autenticação validando usuário realmente sintético via sessão Supabase HML, validação de RLS e vinculação das evidências ao backend implantado; arquivo de workflow GitHub Actions existente, `scripts/hml-counterproofs/*`, `tests/hml/counterproofs/*`, `playwright.hml-counterproofs.config.ts` somente se necessário, e documentação associada. É proibido: ler ou publicar secrets, aceitar `ISOLATED_FIXTURES=true` como prova, fabricar login 200, substituir checks por mock, alterar RLS ou provisionar identidades sem PLAN backend específico, publicar em PROD, desativar guard.

RED referenciado: [44980196211](https://github.com/contaos999999/contaos-hml-control/actions/runs/44980196211); não contém caso de autenticação porque pré-validação bloqueou. A única conclusão segura atual é NO-GO.

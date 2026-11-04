# GOV-018 — PLAN: otimização mensurável do GitHub Actions sem perda de cobertura

**04/11/2026, Brasília | Estado: PLAN, sem BUILD | Escopo: apenas infraestrutura CI.**

## Diagnóstico com dados reais
- Frontend `contaos999999/contaos-hml-control/main@33f167c6b745261c5a21d7bc63aedad4ffd36fd5` (GOV-017 PLAN PR #34 integrado); backend e fontes normativas `contaos999999/develop@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6` intactos; contexto 25/25 e inventário 100/97.
- Run de código #41859649176, SHA `a168a8725066eafab01c2044c3e762c5ea973c61`: `frontend-quality` 15:39:53–15:41:51Z (~118s); Teste C 15:41:54–15:45:09Z (~195s); 24 superfícies × 4 larguras × 2 temas = 192 cenários. Serial total ~316s.
- Run de código #41861082671, SHA `f58265fd595eae5ba5bae8406dc75b2c95afc2b0`: `frontend-quality` 15:45:43–15:47:44Z (~121s); Teste C 15:47:48–15:51:04Z (~196s). GitHub registrou workflow como SUCCESS apenas 16:15:24Z, portanto os ~24 min finais são retenção/atualização de estado pela plataforma **sem causa-raiz comprovada**; o CI do aplicativo não explica essa parte.
- Regressão Vitest `--maxWorkers=1` ~78–88s, typecheck 15–16s, build 5–6s, Teste C browser ~152–154s, instalação Chromium ~25–27s. Run documental PR #34 #41862342763 terminou SUCCESS e Teste C corretamente foi N/A por escopo.
- Gargalo controlável: `teste-c` tem `needs: frontend-quality`, serializando dois checks **independentes**. A prova de aprovação continua sendo a conjunção dos dois status checks exigidos no ruleset.

## Mudança inicial conservadora: código mínimo
Arquivos permitidos **somente após este PLAN aprovado e integrado**:
1. `.github/workflows/contaos-frontend-zero-drift.yml`: remover somente `needs: frontend-quality` de `teste-c`. Preservar nome dos jobs/status checks, `uses`, permissões somente leitura, event triggers, gates canônicos, testes de regressão, typecheck, build, Zero-Drift, contexto e branch protection.
2. `.github/workflows/contaos-teste-c-independente.yml`: adicionar `actions/cache@v4` para `~/.cache/ms-playwright` antes do `playwright install --with-deps chromium`, condicionado a escopo visual. Cache versionado por SO + `playwright@1.64.1`, chave exata sem restore-keys ambíguos; sempre executar instalação de dependências de sistema e verificação do browser. Não cachear `node_modules`, tokens, sessões nem artefatos privados. Manter separação de runners, read-only, evidências SHA e retenção 90 dias. Incluir alteração deste workflow na detecção de escopo Teste C já existente (essa própria alteração já consta na regra).
3. `docs/frontend/auditorias/GOV_018_CI_BASELINE_E_RESULTADO_2026-11-04.md`: documentar baseline acima e medir PR de BUILD (inicio/fim reais de jobs, tempos do Playwright/axe/screenshots, totais, números de casos e checks), separar `queue`, `job duration`, `run state lag`.
4. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: registrar estado comprovado, sem declarar melhoria antes da medição.
5. `scripts/types-autolock-workflow.test.mjs` (OPCIONAL e somente se revisão demonstrar necessidade, caso contrário não alterar). Qualquer teste adicional de orquestração deve ser read-only e preservar nomes obrigatórios.

Arquivos proibidos: `src/**`, `public/**`, `supabase/**`, `src/integrations/supabase/**`, `types.ts`, `package.json`, `bun.lock`, `scripts/testc/visual-audit.mjs`, PRD/arquitetura normativa, migrations, Auth/RLS/RPC, PROD, regras de negócio.

## Gates, teste e compatibilidade
1. Publicar este documento em PR próprio sem alteração de workflow. Exigir 2 checks SUCCESS e integrar.
2. Em branch/PR **diferente**, realizar o menor delta possível; TDD de configuração via verificação estática do grafo CI (não declarar testes não executados). Validar parsing YAML, jobs com mesmos nomes, triggers, `needs` inexistente só em Teste C, cache com chave travada, escopo Teste C preservado.
3. Exigir os dois checks `ContaOS Frontend Zero-Drift` e `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente` no **mesmo SHA**. Comparar run completo antes/depois, confirmar conteúdo do artefato e cobertura **192/192** para mudança com Teste C ativado. Esta mudança de CI deve disparar Teste C, não marcá-lo N/A.
4. Se qualquer check faltar, falhar, não concluir ou perder artefatos, NÃO integrar; corrigir via novo commit ou reverter em novo PR. Não alterar ruleset, checks obrigatórios ou branch protection.
5. Após merge, medir o run `push` da main; investigar atraso de finalização da plataforma, nunca atribuir sem prova ao código.

## Fase 2 condicional, não incluída neste BUILD (separar novo PLAN)
- Testar `vitest run --maxWorkers=2` 3 vezes em branch isolada e comparar mesmas suites e totais; manter `--maxWorkers=1` até passar repetibilidade. Não presumir ganho: maior concorrência pode aumentar uso de RAM e flakiness.
- Dividir Teste C em dois grupos de 96, só com prova de integridade no agregado: nomes únicos 192, 24 superfícies × 4×2, 0 duplicatas/omissões, artefatos e SHA por shard, revisão de gate de acessibilidade e controles com sessão real. Exige alteração de script `scripts/testc/visual-audit.mjs` e novo PLAN PR independente. Nenhum shard pode transformar `NAO_VERIFICADO` em PASS.
- Cache de dependências Bun só se houver evidência de ganho (baseline instalação 2–3s, pode ser contraproducente).

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
BRAND-01/000 lido; impacto visual: N/A, não muda pixels, telas, tokens, CSS, componentes nem logomarca. Contexto Fonte `a10d3b1...` 25/25, mapeamento 100/97. Reutilizar workflow e runner existentes, não criar infraestrutura paralela. Lovable não será acionado. Frontend, backend, PRD, RLS, tipos e PROD intocados. Rollback: restaurar as duas versões anteriores dos YAMLs por PR, sem bypass de proteção. Aceleração **não** autoriza redução da qualidade: dois checks, testes e capturas obrigatórias continuam íntegros. 

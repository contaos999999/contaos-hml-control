# PLAN P0 | F3 CODE, executor funcional individual de 138 caseId

## Objetivo e escopo

Implementar um workflow GitHub Actions de execução **CODE** de cada uma das 138 ligações do catálogo canônico F3, com duas contraprovas executadas por caso aplicável (positiva e negativa) e um verificador independente dos observáveis, sem exigir HML LIVE antes da V5.

**Branch de desenvolvimento:** `feat/f3-code-functional-138-execution`, empilhada sobre a PR #746 no HEAD `479d01b84a03739a5b977e545b3bf20e39c9af17`. Nenhuma alteração na `main`, backend `develop`, dados reais, RLS, certificados ou ledger normativo.

## Arquivos permitidos nesta BUILD

- `docs/frontend/planos/PLAN_P0_F3_CODE_138_FUNCTIONAL_RUNNER.md`
- `scripts/hml/integracao-v1-fase3-functional-138.mjs`
- `scripts/hml/integracao-v1-fase3-functional-138.test.mjs`
- `.github/workflows/contaos-f3-code-138-functional.yml`
- `scripts/hml/f3-code-functional-drivers.mjs` (registro de drivers reais)

## Garantias

1. Catálogo imutável: arquivo e hash canônicos; 120 casos obrigatórios e 18 condicionais; nenhum caso novo ou removido.
2. Runner **não pode** derivar PASS a partir da matriz, de `sourceHints` ou do sucesso de uma suíte genérica. Só consome resultados de testes reais de produtor e consumidor, incluindo rede/fixtures com asserções verificáveis.
3. Para cada `caseId`, executar/inspecionar **positivo** e **negativo** com IDs próprios, conteúdo atestado, sha256 dos eventos e coerência entre identidade de produtor, organização e resultado do consumidor.
4. Revisão independente obrigatória: recibos continuam `SUBMITTED_UNVERIFIED` mesmo com consistência estrutural, até auditor independente.
5. Ausência de driver, erro, replay não confiável ou output incompatível gera `BLOCKED` ou `FAIL`, jamais PASS.
6. Resultado de todo job é **artefato de diagnóstico**, não modificação do ledger protegido. O job deve falhar se qualquer caso aplicável carecer de ambas as provas.
7. A execução CODE roda sem credenciais HML, via fixtures locais isoladas. Mutação HML autenticada e sua certificação apenas no GATE PROD pós-V5.
8. Testes positivos e negativos do próprio runner, com CI, revisão de segurança e zero drift.

## Critérios de conclusão

- Workflow disparado na branch e com artefato JSON de **138 resultados individuais**.
- 276 provas executadas por drivers concretos, com dois `testId` distintos por caso, SHA e cross-check do consumidor.
- `blocked=0`, `failed=0`, `submittedUnverified=138` no relatório CODE, seguido de revisão independente, não certificação automática.
- Nenhuma alteração no ledger normativo sem processo separado.

## Estado inicial e lacuna conhecida

No HEAD base `479d01b`, o CI estava 6/6 verde, mas o ledger CODE tinha `0` provas, `138` `NOT_RUN`. O módulo `createF3CodeCaseRuntime` já contém o despachante com registro funcional a fornecer. A execução deste PLAN deve produzir diagnósticos reais dos drivers ausentes; não é permitido marcar casos como PASS por antecipação.

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
- `src/test/f3-code-case-0036.test.ts` (piloto de integração SYS01 → SYS04, positivo e negativo na lógica real do frontend)
- `src/test/f3-code-case-0037.test.tsx` (piloto de integração SYS01 → SYS05, RPC de dashboard e isolamento da preferência)
- `src/test/f3-code-case-0041.test.ts` (SYS04 preferência → ADM01 RPC permissões efetivas, allow e deny)
- `src/test/f3-code-case-0043.test.tsx` (SYS04 preferência → SYS05, resposta do dashboard e negativa de escopo)
- `src/test/f3-code-case-0045.test.ts` (SYS04 preferência → V101 listagem de contratantes, query org e negativa de acesso)
- `src/test/f3-code-case-0048.test.ts` (SYS04 preferência → V104 listagem contratos, filtro org e negativa 403)

- `src/test/f3-code-case-0051.test.ts` (SYS04 → V107, seleção de contrato e consulta fontes_normativas, positivas e negativas CODE)
- `src/test/f3-code-case-0052.test.ts` (SYS04 → V108, seleção de contrato e consulta propostas_orcamentarias, positivas e negativas CODE)
- `src/test/f3-code-case-0053.test.ts` (SYS04 → V109, seleção de contrato e consulta listas_verificacao, positivas e negativas CODE)
- `src/test/f3-code-case-0056.test.ts` (SYS04 → V112, seleção de contrato e consulta competencias, positivas e negativas CODE)

- `src/test/f3-code-adm01-rbac-integration.test.ts` (25 relações ADM01 → infraestrutura RBAC, lista de organizações e auditoria, vínculo real via wrapper, releitura, permissões e navegação CODE, isolamento negativo por caso)

- `src/test/f3-code-case-0054.test.ts` (SYS04 → V110, releitura real por adapter documentos_contrato e recusa sob fixture CODE)
- `src/test/f3-code-case-0062.test.ts` (SYS04 → V118, releitura real por adapter pareceres_internos e recusa sob fixture CODE)
- `src/test/f3-code-case-0064.test.ts` (SYS04 → V120, releitura real por adapter apresentacoes_contratante e recusa sob fixture CODE)
- `src/test/f3-code-case-0065.test.ts` (SYS04 → V121, releitura real por adapter relatorios_historicos_contratante e recusa sob fixture CODE)

- `src/test/f3-code-sys04-competence-rpc.test.ts` (5 relações SYS04 → RPCs V114, V115, V116, V117, V119: cadeia de seleção, parse do produto, capacidade de ações e isolamento sob fixtures CODE)

- `src/test/f3-code-case-0050.test.ts` (SYS04 → V106, contrato selecionado e detalhe por ID)
- `src/test/f3-code-case-0055.test.ts` (SYS04 → V111, versão e arquivo vinculados, recusa de leitura)

## Garantias

1. Catálogo imutável: arquivo e hash canônicos; 120 casos obrigatórios e 18 condicionais; nenhum caso novo ou removido.
2. Runner **não pode** derivar PASS a partir da matriz, de `sourceHints` ou do sucesso de uma suíte genérica. Só consome resultados de testes reais de produtor e consumidor, incluindo rede/fixtures com asserções verificáveis.
3. Para cada `caseId`, executar/inspecionar **positivo** e **negativo** com IDs próprios, conteúdo atestado, sha256 dos eventos e coerência entre identidade de produtor, organização e resultado do consumidor.
4. Revisão independente obrigatória: recibos continuam `SUBMITTED_UNVERIFIED` mesmo com consistência estrutural, até auditor independente.
5. Ausência de driver, erro, replay não confiável ou output incompatível gera `BLOCKED` ou `FAIL`, jamais PASS.
6. Resultado de todo job é **artefato de diagnóstico**, não modificação do ledger protegido. O job deve falhar se qualquer caso aplicável carecer de ambas as provas.
7. A execução CODE roda sem credenciais HML, via fixtures locais isoladas. Mutação HML autenticada e sua certificação apenas no GATE PROD pós-V5.
8. Testes positivos e negativos do próprio runner, com CI, revisão de segurança e zero drift.

## Gate automatizado CODE

O gate revalida automaticamente o relatório integral, manifesto, hash do relatório, proveniência e unicidade das provas, sem intervenção manual por caso. PASS_CODE exige 138 casos e 276 provas válidas. O certificado formal e o ledger continuam separados; não há exigência LIVE antes da V5.

## Critérios de conclusão

- Workflow disparado na branch e com artefato JSON de **138 resultados individuais**.
- 276 provas executadas por drivers concretos, com dois `testId` distintos por caso, SHA e cross-check do consumidor.
- `blocked=0`, `failed=0`, `submittedUnverified=138` no relatório CODE, seguido de revisão independente, não certificação automática.
- Nenhuma alteração no ledger normativo sem processo separado.

## Estado inicial e lacuna conhecida

No HEAD base `479d01b`, o CI estava 6/6 verde, mas o ledger CODE tinha `0` provas, `138` `NOT_RUN`. O módulo `createF3CodeCaseRuntime` já contém o despachante com registro funcional a fornecer. A integração inicial de C0036 verifica a chamada da RPC real pelo frontend sob fixture local; sua prova CODE permanece SUBMITTED_UNVERIFIED e não prova RLS de HML/PROD. A execução deste PLAN deve produzir diagnósticos reais dos drivers ausentes; não é permitido marcar casos como PASS por antecipação.

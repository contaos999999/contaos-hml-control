# PLAN P0 — Emenda causal PR #661: V1-RCA e proveniência HML por caso

**Data:** 14/11/2026. **Origem:** revisão independente GitHub Edivan5002 #5903917018 sobre PR BUILD #661 @ `e77ab7e4796c6be6682a7c7ce1484fa81bc3e986`. **Estado:** PLAN documental; aplicar em BUILD somente após CI, revisão e merge protegido deste PLAN. Não altera PROD, frontend `src/`, backend, tipos, RLS ou certificados.

## Causa raiz agregada e impacto
A regra constitucional P0-RCA-001 foi ampliada pela emenda X integrada à main para V1 fases 3–7 e todas as revisões, mas o gate BUILD #661 ainda executa apenas escopo e subtestes V1, sem causa/RED/impacto/negativos/regressão. No verificador live, um run Trilha A autenticado de interface poderia ser invocado com strings de caso arbitrárias para atestar jornadas de integração de outra versão sem que a API provasse sua execução. Ambos são exemplos de atribuição de identidade de prova sem vínculo causal, versionado e operacional.
Impacto: V1 revisões/fases 3–7, V2–V5 e certificados internos/cumulativos, P0-versions-first e P0-NR-001; manter históricos V1 funcional PASS, V1 interna PENDENTE, V2–V5 PENDENTE e nenhum PROD.

## Correção B1: RCA em V1, sem retroagir certificações
- O atestado V1 `P0_ESCOPO_V1_ATIVO.json` exigirá **schema v2**, baseline HEAD, arquivos exatos, allowlist prévia, causa confirmada e hipóteses concorrentes descartadas para CORREÇÃO, grafo/matriz de riscos, provas RED histórico em CI GitHub e GREEN/NEG/REG/preventivos realmente executados no SHA auditado; NOVA_FUNCIONALIDADE exige quatro preflight cases autenticados por runner e hash de evidência.
- Reutilizar o **mesmo contrato causal v2** já aplicado a V2–V5 em vez de criar um segundo validador divergente. Evidência V1 criada/alterada na mesma PR funcional, apenas para futuros BUILDs sujeitos ao novo protocolo. Código V1 sob PLAN 75 não recebe PASS de RCA por allowlist + texto. Para governança/scripts, exigir PLAN pré-integrado na PR exata e RCA demonstrada no próprio PLAN se houver correção, sem assumir identidade V1.
- Atualizar `P0_ORDEM_POR_VERSAO_4_1.json` para `controle.rca_impacto.aplica_versoes` incluir V1 e o `p0-version-order-gate.mjs` e negativos para manter a política vinculante.
- Diff `addedLines` deve comparar a base com HEAD da branch real, não o synthetic merge HEAD quando rodar no CI da PR.

## Correção B2: HML por caso/versão/fase, proibição de Trilha A genérica
- Um certificado `PASS` interno/cumulativo exige prova HML de workflow **dedicado às jornadas de integração** `ContaOS P0 Integracao Autenticada`, não basta `ContaOS Trilha A Autenticada`. Essa suíte específica ainda não existe; sem ela, o gate deverá permanecer **NO-GO** para novos certificados, e o workflow dedicado será trabalho próprio de PLAN futuro, não pode ser fabricado por esta PR.
- O recibo `hml_e2e` conterá `escopo=Vn/interna|cumulativa|funcional`, `tested_sha`, `run_url`, arquivo de evidência com SHA256 e lista `casos` de IDs canônicos. Cada ID deverá ter **job exato** no run de workflow dedicado, conclusão SUCCESS e step `E2E autenticado: <ID>` SUCCESS, além de artefato não expirado nomeado pelo escopo e caso com digest SHA256 válido. Verificar ancestralidade do SHA testado e ausência de alterações em `src/`, `public/`, `scripts/`, workflows/contratos e dependências até a prova aprovada.
- Não aceitar nomes quaisquer ou artefatos da Trilha A para certificar integração V2+; também para V1-interna e V2–V5 cumulativos, casos de escopos cruzados = FAIL. O auditor independente deve inspecionar conteúdo dos casos/artefatos antes de certificar. O guard garante proveniência e execução declarada, não a semântica clínica/financeira.

## Escopo fechado do BUILD #661, sem expandir para produto
1. `scripts/p0-rca-impact-gate.mjs`
2. `scripts/p0-rca-impact-gate.test.mjs`
3. `scripts/p0-evidence-live-gate.mjs`
4. `scripts/p0-evidence-live-gate.test.mjs`
5. `scripts/p0-version-order-gate.mjs`
6. `scripts/p0-version-order-gate.test.mjs`
7. `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`
8. `docs/frontend/governanca/P0_RCA_IMPACTO_ANTIRRETRABALHO_V2_V5_2026-11-14.md`
9. `.github/workflows/contaos-frontend-zero-drift.yml` somente se necessário para runner operacional, sem relaxar teste
10. `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md` somente complemento sem revogar P0.

## Testes RED/negativos e critérios GREEN
- V1 PLAN 75 + arquivo V1 allowlisted, atestado v1 sem RCA = FAIL; RCA com causa plausível, hipóteses ausentes, riscos sem preventivo, RED inexistente ou não ancestral, GREEN sem execução = FAIL. V1 RCA v2 completo e prove real = PASS no teste; V2–V5 não sofrem regressão.
- Um workflow visual Trilha A SUCCESS sem job de caso de integração = FAIL; `casos:["INVENTADO"]` = FAIL; V2 cumulativa com job V1/interna ou artefato de outro escopo = FAIL; HML sem artifact/digest ou com Playwright SKIPPED = FAIL; dedicated workflow hipotético com job, step e artefato de caso exato = PASS apenas no fixture sintético, nunca chamado de prova real.
- Diff com synthetic merge contendo arquivo V2 da main, mas branch mudando apenas V1: classificação baseada no HEAD real, sem false positive.
- Suites atuais P0, 100/97, testc, tipo imutável, escopo de produto e CI Zero-Drift/LOCK continuam íntegros; P0-NR-001 ledger e workflow não são alterados nesta PR.

## Rito e critério de encerramento
PLAN doc `main` após checks/revisão protegida; BUILD da PR #661 com testes RED/GREEN e CI do HEAD final, integrar branch com main atual sem forçar push, preservar P0-NR-001, nova auditoria da Edivan5002 em uma passada completa; APPROVED + dois CI obrigatórios + readback após merge; checkpoint. Nenhum certificado V1/V2–V5 ou PROD alterado por esse BUILD. Casos E2E reais continuam pendentes até PLAN e runner dedicado, sem insinuar certificado. **ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO):** economia não substitui evidência, auditoria e controles.

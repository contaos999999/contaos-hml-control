# P0 V2–V5 — PLAN técnico protegido: gate triplo e RCA/impacto
Data: 14/11/2026. Estado: **PLAN documental pendente CI e merge; NÃO certifica V1 interna ou V2 e NÃO autoriza PROD**.

## Baseline
- Frontend `contaos999999/contaos-hml-control` main `77bb34cd00afc863bd31055984b7275a4eb0310d` na abertura da rodada, confirmar após PLAN merge.
- Backend normativo `contaos999999/develop` main `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, consulta somente leitura (não alterar).
- PR #659 merge `77bb34cd00afc863bd31055984b7275a4eb0310d` documentou o Plano Único V2 e P0-RCA-001; não habilitou controles de CI.
- V1 certificado funcional `PASS` e V2 `PENDENTE` segundo manifesto `P0_ORDEM_POR_VERSAO_4_1.json`. Auditoria interna de integração V1 em curso; não presumir PASS.
- Contexto normativo: AGENTS.md, `P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md`, `P0_RCA_IMPACTO_ANTIRRETRABALHO_V2_V5_2026-11-14.md`, `P0_V2_PLANO_UNICO_CERTIFICACAO_INTEGRACAO_CUMULATIVA_2026-11-14.md`, plano mestre interno V1, 100 regulares/97 atômicos, 25 fontes canônicas do backend (validação do snapshot e novos HEADs antes do BUILD).
- Risco causal identificado: guard `p0-version-order-gate.mjs` hoje só verifica certificado funcional da versão anterior e aceita V2/44 após V1/PASS; não representa auditoria interna nem acumulada. `P0-RCA-001` exige RCA mas CI não a verifica. Não corrigir os sintomas com certificado fictício ou com `PASS` retroativo.

## Mudança técnica planejada (uma cadeia PLAN → GATE → BUILD → GREEN)
1. **Preservar estrutura atual** `controle.certificados_por_versao` e seus recibos; adicionar somente registro `controle.integracao_por_versao` com esquema fixo e status `PENDENTE` em V1 interna e interna/cumulativa V2–V5. V1 acumulada é base fundacional, não certificado fictício.
2. Adicionar validação tripla no `scripts/p0-version-order-gate.mjs` (ou helper único testável):
   - V2 PLAN/BUILD sob prompt regular 44–49/76–77 exige V1 funcional **e** integração interna V1 PASS comprovada; preserva o PLAN/BUILD V1 atual e consultas documentais não numeradas.
   - V3/V4/V5 exigem da versão anterior funcional + interna + cumulativa PASS; a auditoria global também exige V5 tripla.
   - Recibos PASS só aceitos com arquivo canônico existente, SHA de merge, CI e vínculo de revisão independente; status PENDENTE ou NO_GO nunca libera. Sem prova, falhar fechado.
   - Detectar tentativas de alteração de certificados/campos obrigatórios e de sequenciamento; não mudar inventário 100/97 nem aceitar atalhos em branch/PR.
3. Criar guard `scripts/p0-rca-impact-gate.mjs` com helper testável. Quando o plano ativo estiver em **V2–V5** e houver mudança de implementação `src/` (fora tipos imutáveis), exigir ficha `docs/frontend/rca/P0_RCA_ATIVO.json` com ID, modalidade NOVO_DESENVOLVIMENTO ou CORRECAO, baseline, mapa de dependências/riscos, testes preventivos, rollback e evidências.
   - Em CORRECAO exigir sintoma reproduzido, causa raiz CONFIRMADA e prova de descarte das alternativas, RED causal/negativos, regressão e análise de riscos do patch.
   - Em NOVO_DESENVOLVIMENTO exigir preflight e mapa de impacto, sem inventar defeito prévio.
   - Exigir ficha nova/atualizada no mesmo diff e fail-closed para valores ausentes, `PASS` vazio, impacto sem teste ou arquivo fora da mudança.
   - Não aplicar retroativamente a mudanças V1 legítimas em andamento e não falsear auditoria independente. O gate verifica forma e consistência mínima, não prova execução HML.
4. Acoplar testes e guard ao Zero-Drift CI após o gate P0 atual. Deve permanecer obrigatório o mesmo Teste C e todas as suites originais.
5. **Testes negativos antes de GREEN:** V2 com V1 interna pendente bloqueado; V2 liberado somente com interna V1 comprovada; V3 sem V2 cumulativa bloqueado; PASS sem evidencia/CI/revisão bloqueado; alterou 100/97 bloqueado; V1 corrente mantida; RCA faltando, sem causa, sem evidência, sem mapa/testes, modo inválido bloqueados; cenário válido e docs-only PASS.
6. Atualizar documentos de governança com estado efetivo do protocolo depois do merge, sem declarar gate automatizado na etapa PLAN nem reclassificar certificados.

## Allowlists técnicas fechadas
- `docs/frontend/planos/P0_V2_GATE_TRIPLO_RCA_PLAN_2026-11-14.md` (este documento)
- `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`
- `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md` (marcação do estado técnico conforme prova)
- `docs/frontend/governanca/P0_RCA_IMPACTO_ANTIRRETRABALHO_V2_V5_2026-11-14.md` (referência do guard, caso necessário)
- `scripts/p0-version-order-gate.mjs`, `scripts/p0-version-order-gate.test.mjs`
- `scripts/p0-rca-impact-gate.mjs`, `scripts/p0-rca-impact-gate.test.mjs`
- `.github/workflows/contaos-frontend-zero-drift.yml`
Não editar outros caminhos, `PLANO_ATIVO.json`, código `src/`, `types.ts`, backend, migrations, Supabase, políticas de branch, Auth, segredos, HML ou PROD.

## Impacto e regressão previstos
- Não quebrar a execução atual da V1 cujo `PLANO_ATIVO.prompt_id=75`.
- Não converter `certificados_por_versao.V1.status=PASS` em NO_GO; manter certificado e preservar auditoria interna V1 ainda pendente.
- Não bloquear PRs documentais de planejamento da V2 só por nome genérico sem regular, mas bloquear de modo inequívoco o PLAN regular 44 se faltar certificado de integração interna V1; deliberadamente só se executa quando gate de progressão atendido.
- Não fabricar certificados com strings vazias, hashes fictícios ou arquivo de prova inexistente.
- Evitar regressão por import que invoque `main()` no teste, import puro, utilitário Node embutido, nenhum pacote novo.
- Não criar duplicate suites custosas; inicializar testes unitários do novo guard e rodar uma única vez no CI já existente.

## Critério de aceite
- PLAN documental integrado em PR protegido antes da primeira edição de scripts/YAML/manifesto.
- RED testável registrado (casos negativos reais antes da implementação), GREEN no HEAD exato, testes P0 anteriores e novos PASS, Zero-Drift, LOCK e Teste C SUCCESS no workflow exigido.
- Revisão independente do diff/semântica antes do merge técnico, sem autoaprovação fictícia.
- Merge protegido com HEAD travado, readback de arquivos e estado/pendências no checkpoint.
- Novo gate não é certificação das 22 fases da V2; apenas protege progressão e RCA. Sem GO PROD.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Nenhuma alteração visual ou de backend; usar GitHub direto, reusar suites e artefatos já comprovados, zero chamada Lovable desnecessária, manter fontes, 100/97, LOCK, segredos, marca, Teste C e regras P0 integralmente.

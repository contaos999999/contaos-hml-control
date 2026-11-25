# PLAN P0 — Fase 3 CODE: revalidação do BUILD #748 para PR #750

**Estado:** PROPOSTO — validação CI e revisão necessárias antes da integração. Não é autorização retroativa nem certificação. PR #750 reservada apenas com documentação; preservar #748 sem force-push ou alteração de histórico.

## Causa comprovada
- Gate funcional anterior no HEAD 489924b41c2f555ccdb76d152d9dc327dfd97fd2: CI 45521644438, job 138894752543, 138/138 e 276/276, PASS_CODE, relatório SUBMITTED_UNVERIFIED; artefato 14979669678 e SHA relatório b939bd8ed21aa72345580860485988ff449dc72f899fbb06de279413ed455cda.
- Zero-Drift 45521644526/job 138894836538: PLAN pré-BUILD não inclui os 27 testes src, autorização P0_GOV_PLAN_748 ausente e Context Gate desalinhado. PLAN ativo declara fonte 1504af465b45afc846458d00e5cb63513fa298ed, snapshot e develop/main real apontam a1516de1d8949e505d83b5e000eb1cc558b217a7. Compare GitHub: 28 commits, 11 caminhos alterados, nenhum dos 25 documentos ou catálogo docs/prompts/PROMPT_TRACKS_4_1.json. Snapshot já registra reancoragem 26/26 blobs idênticos. Leitura histórica de 15/11 preservada; nova revisão semântica e validação não alegadas como concluídas por este documento.
- Não é falha de execução individual do catálogo. Não reutilizar o resultado funcional anterior como CI de outro SHA.

## Escopo fechado de reaplicação
- `.github/workflows/contaos-f3-code-138-functional.yml`
- `docs/frontend/planos/PLAN_P0_F3_CODE_138_FUNCTIONAL_RUNNER.md`
- `scripts/hml/f3-code-functional-drivers.mjs`
- `scripts/hml/integracao-v1-fase3-functional-138.mjs`
- `scripts/hml/integracao-v1-fase3-functional-138.test.mjs`
- `src/test/f3-code-adm01-dashboard.test.tsx`
- `src/test/f3-code-adm01-rbac-integration.test.ts`
- `src/test/f3-code-case-0036.test.ts`
- `src/test/f3-code-case-0037.test.tsx`
- `src/test/f3-code-case-0041.test.ts`
- `src/test/f3-code-case-0043.test.tsx`
- `src/test/f3-code-case-0045.test.ts`
- `src/test/f3-code-case-0048.test.ts`
- `src/test/f3-code-case-0050.test.ts`
- `src/test/f3-code-case-0051.test.ts`
- `src/test/f3-code-case-0052.test.ts`
- `src/test/f3-code-case-0053.test.ts`
- `src/test/f3-code-case-0054.test.ts`
- `src/test/f3-code-case-0055.test.ts`
- `src/test/f3-code-case-0056.test.ts`
- `src/test/f3-code-case-0062.test.ts`
- `src/test/f3-code-case-0064.test.ts`
- `src/test/f3-code-case-0065.test.ts`
- `src/test/f3-code-sys04-competence-rpc.test.ts`
- `src/test/f3-code-sys04-preference-guard-actions.test.ts`
- `src/test/f3-code-v102-v103-contracting-party.test.ts`
- `src/test/f3-code-v105-v106-contract-actions.test.tsx`
- `src/test/f3-code-v107-v108-v109-v122-material-source.test.ts`
- `src/test/f3-code-v110-v111-v115-document-actions.test.ts`
- `src/test/f3-code-v113-created-competence.test.tsx`
- `src/test/f3-code-v116-v117-analysis-review.test.ts`
- `src/test/f3-code-v118-v119-material-actions.test.ts`
- `docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json` — ficha causal por diff exato, baseline efetivo após PLAN, RED real de Zero-Drift com teste identificável, GREEN/NEG/REG executáveis.
- `docs/frontend/planos/F3_CODE_138_REAPLICACAO_BUILD.md` — reserva documental da PR #750.
- No PLAN documental separado: `docs/frontend/planos/PLANO_ATIVO.json`, `docs/frontend/planos/P0_GOV_PLAN_750.json` e este documento, somente após revisão do escopo e contexto. Nenhuma mudança nos guards.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Sem alterações de identidade visual, rotas, componentes de produção, tipos gerados, Supabase, dados, RLS, Auth, Edge, migrations, ledger ou PROD; impacto visual de produto N/A por serem testes e runner. Preservar Teste C quando aplicável. Sem Lovable. Norma P0-CERT-LIVE-001 de 22/11/2026 exige CODE automatizado, integração, segurança, regressão, CI no SHA e revisão; LIVE somente GATE PROD após V5, sem dispensa de segurança.

## Sequência de execução
1. Validar o PLAN documental com CI próprio, leitura/revisão canônica e escopo. Atualizar o PLAN ativo mantendo o histórico, vincular autorização específica à PR #750; somente integrar após validação real e revisão.
2. Reancorar a branch #750 sobre o PLAN integrado sem force-push; nenhuma fonte src deve preceder o PLAN válido na nova linhagem.
3. Produzir RED real em Zero-Drift para a lacuna de execução por caseId antes da reaplicação GREEN; preservar evidências históricas. RCA gate exige run Zero-Drift failure, SHA ancestral e nome de teste observável no log; não substituir por falha de outro workflow nem alegar RED fictício.
4. Reaplicar blobs da PR #748, formatar todos os arquivos no código versionado e trocar a etapa de Prettier temporário por check não mutável; verificar tipagem, lint, build e regressão. Não alterar testes para mascarar falhas.
5. Reexecutar CI integral no novo HEAD; gate funcional exige 138 IDs distintos e 276 evidências, zero falhas/bloqueios, mesmos limites CODE. Auditoria das evidências, revisão independente e merge protegido somente após todos os gates.
6. Emissão de certificado/ledger em etapa separada após integração e verificação de proveniência; não confundir SUBMITTED_UNVERIFIED/PASS_CODE com certificado formal.

## Riscos e rollback
Falso PASS por mocks sem asserções, escopo de dados incorreto, artefato não ligado ao SHA, regressões ocultas, autorização retroativa. Mitigar com testes positivos/negativos do executor, leitura e hash, fonte e escopo verificáveis, prova prévia de PLAN, CI imutável e revisão. Rollback: manter #748 e #750 em draft, rejeitar a reaplicação e reverter apenas PR documental por nova PR se necessário; nenhum efeito em dados ou produção.

**Autorização de execução:** titular determinou continuar até concluir e executar a regularização. Não se presume aprovação humana independente desta proposta.

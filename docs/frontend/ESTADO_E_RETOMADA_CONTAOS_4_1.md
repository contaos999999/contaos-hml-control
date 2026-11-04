# ContaOS 4.1 — Estado vivo e protocolo de retomada entre chats

**Canal oficial de continuidade.** Documento de referência para quando uma conversa acabar, precisar trocar de chat, houver perda parcial do histórico ou outra pessoa/instância assumir o trabalho. **Atualizar o checkpoint ao terminar qualquer bloco de correções.**


## CHECKPOINT PRIORITÁRIO — RETOMADA PROMPT 41 / V1-20, 04/11/2026

**Última main frontend confirmada antes deste PLAN:** `contaos999999/contaos-hml-control/main@657b350fa43c30177df399667fbc885aa1a2599a` (PR #45 integrado). **Fonte normativa:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`, branch padrão `main`. A verificação foi realizada diretamente no GitHub; nunca presumir que esses SHAs permanecem HEAD após novos merges.

- **Última etapa funcional comprovada:** PROMPT 40/V1-19 integrado no PR #44, HEAD de BUILD `ef128b9825da14af5e82eb51b09d8d65ce6ddc51`, CI #41885026808 com dois jobs SUCCESS, 841 testes e Teste C 200 combinações/24 capturas no escopo, HML autenticado NÃO VERIFICADO. Dossiê consolidado no PR #45, merge `657b350fa43c30177df399667fbc885aa1a2599a`. Não repetir.
- **Trabalho aberto na retomada:** PR [#46](https://github.com/contaos999999/contaos-hml-control/pull/46), PLAN preliminar exclusivamente documental do PROMPT 41/V1-20, branch `plan/prompt-41-v120-protocolo-20261104`, arquivo `docs/frontend/planos/PROMPT_41_V1_20_APRESENTACAO_PROTOCOLO_2026-11-04.md`. O documento permanece **NÃO VALIDADO** independentemente do CI ou da integração do PR; **BUILD NÃO AUTORIZADO**. O PR documenta a rota canônica `/competencias/:id/apresentacoes/:apresentacaoId`, leitura apenas por Data API/RLS e preservação de pacote/snapshot.
- **CI comprobatório de commit anterior do PLAN:** run [41888013334](https://github.com/contaos999999/contaos-hml-control/actions/runs/41888013334) para HEAD `1e334e071c1ff17400741d468de855ef1c3ed513` com ambos jobs SUCCESS; Teste C Playwright SKIPPED por filtro documental. Revalidar CI do HEAD final do PR #46 antes de merge; resultado anterior não valida novos commits.
- **Fonte canônica:** verificação read-only de **25/25 SHA Git idênticos** ao snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` em `develop/main`. Catálogo `docs/prompts/PROMPT_TRACKS_4_1.json` blob `e54e49e626e65a9c94c81709180fd192a1f0c079` inclui 100 prompts regulares, 97 atômicos e crosswalk 41→V1-20/000. Tracker contém 39 etapas e matriz histórica 416 critérios; **não confundir inventários com execução certificada**. O DOCX original do manual de 100 prompts não está materializado como blob individual na árvore GitHub e o texto literal do PROMPT 41 segue NÃO VERIFICADO.
- **Controle imutável:** `src/integrations/supabase/types.ts` blob real `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` confirmado. Ruleset #26495643 ACTIVE: PR, dois checks requeridos, zero revisões humanas de PR, proibição de exclusão/non-fast-forward e bypass `never`.
- **Pendências não encerradas:** snapshot detalhado do pacote e leitura RLS real por identidades HML, E2E A/B, telas privadas autenticadas, acessibilidade integral, retenção institucional e exigências pendentes dos 416 critérios. O esquema tipado de `apresentacoes_contratante` e `pacotes_competencia` não comprova autorização RLS nem provê, por si, os bytes do snapshot. Não reconstruir o pacote a partir dos documentos vivos.
- **Próxima ação comprovadamente permitida:** finalizar PR #46 documental após CI verde no SHA final; posteriormente recuperar requisito literal PROMPT 41, validar contrato de leitura autorizado e emitir PLAN/GATE **separados** com allowlist formal e aprovação técnica. Caso a verificação exija investigação do Supabase/backend, pedir autorização específica antes de transitar para esse fluxo, conforme ADR-DEV-002. Não alterar `PLANO_ATIVO.json` do PROMPT 40 nem iniciar BUILD até tudo estar PASS.
- **Escopo desta retomada:** documentação GitHub somente; frontend funcional, arquivos BRAND, backend, Supabase HML, PROD e Lovable BUILD intocados.

---

## CHECKPOINT PRIORITÁRIO — PROMPT 40 / V1-19 INTEGRADO, 04/11/2026

**Estado oficial verificado no GitHub:** `contaos999999/contaos-hml-control/main@2bc2696b1272cce74f6aaaae4dd608751b469f5b` (PR #44 integrado); backend normativo `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`, snapshot 25/25, 100 prompts regulares e 97 atômicos, `src/integrations/supabase/types.ts` blob imutável `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

- **GOV-017** logomarca transparente concluída, PR #39 merge `ab2a10dffa590416dc1bdbc0e57c7405db7d9708`. V1-18 usou marca oficial e tokens do Design System em revisão estática; visual HML autenticado NÃO VERIFICADO.
- **GOV-018** CI em paralelo e cache Chromium concluído, PRs #35–37, sem repetir.
- **GOV-019** Vitest 2 workers concluído, PR #41 merge `ca5bc8db579a6788ad2b6778c2b7b83f23b223cb`, 3 ensaios de 29 arquivos/828 testes PASS, configuração permanente `--maxWorkers=2`.
- **PROMPT 40/V1-19 PLAN** PR #42 integrado no merge `7aa9324ad1a9f505a1c2d9490608dd539c2c684e`; **GATE** PR #43 integrado no merge `222ca3128732e504737c7e0db7221be094b4b327` com PLANO_ATIVO 40/atômicos 000 e 067; ambos dois checks verdes.
- **PROMPT 40/V1-19 BUILD** PR [#44](https://github.com/contaos999999/contaos-hml-control/pull/44) integrado na main `2bc2696b1272cce74f6aaaae4dd608751b469f5b`, head testado `ef128b9825da14af5e82eb51b09d8d65ce6ddc51`, CI [run #41885026808](https://github.com/contaos999999/contaos-hml-control/actions/runs/41885026808), **dois check-runs SUCCESS no mesmo SHA**. Vitest 30 arquivos/841 testes PASS, TypeScript PASS, produção build PASS, Zero-Drift/Brand PASS, scope gate 12 files e nenhum backend modificado. Teste C **200 combinações e 24 capturas**, classificação `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA`, artefato `contaos-teste-c-41885026808-1`, ID `13351920495`, hash e somente leitura PASS.
- **Correções efetuadas no BUILD:** lint Prettier, TypeScript params opcionais RPC, meta index signature, e sincronização exata de `src/routeTree.gen.ts` com TanStack Router; commit final do reparo `ef128b9825da14af5e82eb51b09d8d65ce6ddc51`. Não repetir nem inventar backends.
- **Segurança operacional:** E2E HML com sessão real de aprovador, organização cruzada/RLS e confirmação real de criação de pacote no backend **NÃO VERIFICADOS**. CI/estáticos/mocks não equivalem a produção aprovada.
- **CI push pós-merge:** run `41885691797` disparado no SHA `2bc2696b1272cce74f6aaaae4dd608751b469f5b`. No registro inicial do checkpoint status final pendente; confirmar antes de considerar a integração operacional completamente auditada.
- **Próxima tarefa comprovada:** identificar no manual original o PROMPT regular **41/V1-20** (Apresentação/protocolo) e criar PLAN PR separado, respeitando 000/BRAND-01, fonte canônica e pré-gate; não implementar sem contrato normativo. Atualizar este checkpoint e os HEADs antes de eventual nova conversa.
- **Dossiê oficial:** `docs/frontend/auditorias/PROMPT_40_V119_IDENTIDADE_E_TESTES_2026-11-04.md`. **Rollback:** PR específico e testes de regressão, sem apagar aprovações, pacotes ou apresentações no Supabase.

---

## CHECKPOINT ATUAL — PROMPT 40 / V1-19, 04/11/2026

**Última HEAD comprovada antes do BUILD:** `contaos999999/contaos-hml-control/main@222ca3128732e504737c7e0db7221be094b4b327`; backend/fonte canônica `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Fonte 25/25 e catálogo 100/97 sem deriva, `types.ts` Git blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, não alterar.

- **GOV-017 logomarca transparente:** PR #39 integrado em `ab2a10dffa590416dc1bdbc0e57c7405db7d9708`, Teste C 192/192 e crivo V1-18 estático PASS. HML privado NÃO VERIFICADO. Não repetir.
- **GOV-019 Vitest dois workers:** PLAN PR #40, BUILD PR #41 integrado em `ca5bc8db579a6788ad2b6778c2b7b83f23b223cb` com dois checks SUCCESS. Três ensaios 29 arquivos/828 testes PASS, tempos 65/65/63s; CI permanente `vitest run --maxWorkers=2`. Não repetir.
- **PROMPT 40 PLAN:** PR #42, dois checks SUCCESS, run `41880258322`, SHA validado `8e6fde7caf5ebecc5527dbec8be4fb6fa75da48d`, merge `7aa9324ad1a9f505a1c2d9490608dd539c2c684e`, especificação `docs/frontend/planos/PROMPT_40_V1_19_WIZARD_APRESENTACAO_2026-11-04.md`.
- **PROMPT 40 GATE:** PR #43, dois checks SUCCESS run `41881374268`, merge `222ca3128732e504737c7e0db7221be094b4b327`. `PLANO_ATIVO.json` com prompt 40, atômicos 000/067, 25 fontes, allowlist fechada.
- **V1-19 BUILD em execução, NÃO INTEGRADO:** branch `build/prompt-40-v119-wizard-20261104`; rota `/competencias/:id/apresentar`, RPCs certificadas `aprovar_apresentacao` e `registrar_apresentacao`, `allowed_actions.apresentar` do backend, idempotência criptográfica por intenção, sem UPDATE direto; BRAND-01 oficial, `src/routeTree.gen.ts`, testes `src/test/competenciaApresentar.test.tsx`, matrizes Teste C 25×4×2=200, dossiê `docs/frontend/auditorias/PROMPT_40_V119_IDENTIDADE_E_TESTES_2026-11-04.md`.
- **TESTES/CI/PR:** resultado ainda PENDENTE. TDD RED commit inicial existe, mas execução real RED não foi efetuada isoladamente; verificar GREEN por CI. Validar 2 checks SUCCESS no mesmo SHA da branch e logs de 200 casos Teste C, salvar ID de artefato; **nunca declarar HML RLS real autenticado com base em mock**.
- **Próxima ação exata:** abrir BUILD PR, corrigir qualquer falha demonstrada até dois checks SUCCESS, integrar somente sem bypass, confirmar HEAD da main e CI push; atualizar este checkpoint com run, commit de merge e próxima tarefa PROMPT 41 / V1-20 conforme fonte original.
- **Rollback:** PR para retirada da rota V1-19 e navegação, jamais apagar registros reais do Supabase ou mexer em source types certificado.

---

## CHECKPOINT DE CONTINUIDADE — GOV-017 FINAL E GOV-019 VITEST, 04/11/2026

**Última main confirmada antes deste experimento:** `contaos999999/contaos-hml-control/main@953ee28c95230d75a128ffed852d30060a7533a2`. Fonte canônica: `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6` (25/25, 100/97), `types.ts` certificado Git blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

- **GOV-017:** PLAN PR #34; gate PR #38; BUILD PR #39 (head validado `2babc39ebb82089ddb7a1dfb17ae450d82c46521`; dois checks SUCCESS, CI run `41874233461`), merge `ab2a10dffa590416dc1bdbc0e57c7405db7d9708`. SVG branco transparente aplicado a `ContaOSMarca` com original preservado; BRAND V1-18 PASS estático, HML autenticado **NÃO VERIFICADO**. Teste C 192 combinações, 24 capturas, artefato `contaos-teste-c-41874233461-1` ID `13345847149`.
- **GOV-019 PLAN:** PR #40 com dois checks SUCCESS e merge `953ee28c95230d75a128ffed852d30060a7533a2`; documento `docs/frontend/planos/GOV_019_VITEST_2_WORKERS_2026-11-04.md`.
- **GOV-019 ensaio:** PR #41 run `41875827954`, três execuções independentes de `bunx vitest run --maxWorkers=2`: 828/828 testes em 29 arquivos por execução, 65s, 65s e 63s instrumentados, 3/3 PASS; CI completo SUCCESS, dois checks SUCCESS. Adoção em commit posterior `50c488e4e0c6f90d806353993dd3b15941d9ef59` volta a UMA suite com 2 workers; **exigir novo CI dos commits finais** antes de merge, não declarar permanente até HEAD confirmado.
- **Próxima tarefa após CI final + merge do GOV-019:** PROMPT regular **40** / tela **V1-19 Wizard de apresentação** `/competencias/:id/apresentar`, atômicos **000 e 067**, fonte original `Manual_Mestre_Prompts_4_1_100_PRD_original.docx` lida; RPCs tipadas `aprovar_apresentacao` e `registrar_apresentacao`, idempotência, `allowed_actions.apresentar` por `obter_visao_geral_competencia`. Criar PLAN, gate, BUILD e Teste C; crivo BRAND pós-módulo; não alterar backend/PROD/constantes certificadas.
- **Proteções:** ruleset `ContaOS-Zero-Drift-main` dois checks, PRs separados; backend Supabase único e fonte de autorização; não afirmar HML E2E real sem credenciais e provas; nenhuma refatoração de infraestrutura fora dos planos.
- **Checkpoint de rollback:** usar PR para restaurar `--maxWorkers=1` se detectar flakiness/perda de cobertura no futuro.

---

## CHECKPOINT ATUAL — GOV-017 BRAND TRANSPARENTE E AUDITORIA V1-18, 04/11/2026

**Antes do BUILD:** `contaos999999/contaos-hml-control/main@ca74b9555a46f0de8f01020b8cb779f412fcee40`; fonte normativa `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6` (25/25, prompts 100/97); `types.ts` bloqueado em `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

- **GOV-017 PLAN:** PR #34, 2 checks SUCCESS, merge `33f167c6b745261c5a21d7bc63aedad4ffd36fd5`.
- **GOV-017 GATE:** PR #38, 2 checks SUCCESS, merge `ca74b9555a46f0de8f01020b8cb779f412fcee40`, PLANO_ATIVO prompt 16 / atomic 000, autorização expressa para variante SVG alpha preservando original.
- **BUILD em andamento:** branch `build/gov-017-logo-transparente-20261104`, commits TDD test `fd15204c4c1ae3ad7a1a442de7bc4fb7dc441fb9` (RED previsto não executado isoladamente), SVG derivado `922b41b82d12bd524a25aeaf5c5890ff3778d046`, componente compartilhado `b405bb544930a38a8637129bcd21fbede342a55c`, ajuste teste `9104e190f04ead9836fbd16f41405c6fa51dcd38`, auditoria `docs/frontend/auditorias/GOV_017_BRAND_SEM_FUNDO_2026-11-04.md`. Ainda NÃO declarar GREEN antes de PR CI e Teste C.
- **Fonte imutável do logo:** SVG branco oficial SHA-256 `099518bc6ff6b83d4380071b99410dbbbdb43805790c7ad6b0437ba16ae14c36`; derivado sem único retângulo de fundo SHA-256 `d9fa1c6f1dee18ea74f3dfe8b8ea6b8edb5100b7e863a51cf21597924030b438`; nenhuma alteração de logos certificados.
- **Crivo V1-18:** código usa `ContaOSMarca`, tokens e componentes existentes, navegação responsiva e estados de UI; nenhum hexadecimal próprio ou fonte paralela. PASS **estático**. V1-18 autenticada HML em 1440/1280/768/390 e WCAG completo **NÃO VERIFICADO**; rotas privadas Teste C sem credenciais não representam execução autenticada.
- **Próxima ação:** finalizar BUILD PR GOV-017 com dois checks SUCCESS e 192 cenários; arquivar evidências e integrar; só então abrir PLAN do ensaio Vitest com 2 workers (3 repetições) e, após prova, PROMPT 40/V1-19 com crosswalk 000/067, gate e BUILD, sem backend/PROD. A infraestrutura CI GOV-018 já está integrada, não repetir PR #35–37.
- **Risco e rollback:** Se falhar, reverter exclusivamente os arquivos de escopo da correção visual em PR; registrar SHA/CI, sem bypass ou force push.

---

## CHECKPOINT PRIORITÁRIO — GOV-018 OTIMIZAÇÃO CI CONCLUÍDA, 04/11/2026

**Estado comprovado:** frontend `contaos999999/contaos-hml-control/main@070022bb72c86c221f0f02898b7b9c3e3db67b9c`; backend/norma `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; 25 fontes e catálogo 100/97, `types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, sem mudanças.

- **GOV-018 PLAN integrado:** PR #35, documento `docs/frontend/planos/GOV_018_OTIMIZAR_CI_2026-11-04.md`, 2 checks SUCCESS; merge `b34e53561587d46cbf600ff3b70e35ccbdf4b8ad`.
- **GOV-018 BUILD integrado:** PR #36, commit testado `d478b5829064f53563b9136cd4cc0f0ccc436faa`; run [#41869470067](https://github.com/contaos999999/contaos-hml-control/actions/runs/41869470067), dois checks SUCCESS e merge em `070022bb72c86c221f0f02898b7b9c3e3db67b9c`. Alterações SOMENTE nos dois workflows CI, baseline e checkpoint.
- **Medição A/B:** qualidade 104s, Teste C 191s, início em paralelo dentro de 9s; tempo total 191s versus 321s baseline, redução observada 130s (~40,5%). Teste C `192 combinações`, `25 capturas`, artefato `contaos-teste-c-41869470067-1` ID `13344291691`, teste read-only e checks de brand/zero-drift PASS. Cache Chromium 1.64.1 MISS inicial seguido de SAVE, benefício do HIT futuro não comprovado. Dossiê `docs/frontend/auditorias/GOV_018_CI_BASELINE_E_RESULTADO_2026-11-04.md`.
- **CI push pós-merge:** run `41870259996` iniciou na `main`, estado final ainda não apurado neste checkpoint. Não confundir job concluído e eventual atraso da API na finalização do workflow. HML autenticado NÃO VERIFICADO, sem afirmação de E2E privado.
- **GOV-017:** PR #34 PLAN da logomarca transparente foi integrado em `33f167c6b745261c5a21d7bc63aedad4ffd36fd5`, mas **a correção do SVG não foi integrada**. Próxima tarefa funcional: novo PR exclusivo gate `PLANO_ATIVO` GOV-017, CI verde, depois BUILD e Teste C da variante transparente; preservar asset oficial original.
- **Depois do GOV-017:** PROMPT 40 / V1-19 Wizard de apresentação, PLAN→GATE→BUILD→Teste C, crosswalk 000/067, RPCs oficiais `aprovar_apresentacao` e `registrar_apresentacao`, sem modificar backend sem autorização.
- **Fase 2 CI:** somente se justificável após medir HIT/cache e repetir baseline, planejar em PR separado Vitest 2 workers e particionamento Teste C 2×96, preservando agregação e 192/192.
- **Rollback:** PR restaurando versões anteriores dos dois workflows sem desabilitar check, sem force push, sem bypass. Todos os resultados devem ser comprovados por SHA/run antes de serem declarados concluídos.

---

## CHECKPOINT PRIORITÁRIO — PROMPT 39 / V1-18, 04/11/2026

**Este checkpoint tem precedência sobre indicações históricas de “próxima tarefa” nas seções abaixo; sempre conferir HEAD e CI correntes.**

- **Última implementação funcional identificada:** PROMPT 38 / V1-17, drawer de detalhe do requisito, implementada no frontend. Não repetir.
- **Frontend baseline confirmado:** `contaos999999/contaos-hml-control/main@15bf2aa6fab6b4c9e262a7d74b6a2ea422419e1f`; CI pré-PLAN `41842635961` SUCCESS.
- **Fonte normativa:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Os 25 blobs canônicos e o catálogo 100/97 estão iguais ao snapshot anterior; o `source_commit` foi atualizado via PR #28.
- **PLAN da próxima etapa:** `docs/frontend/planos/PROMPT_39_V1_18_PARECER_INTERNO_2026-11-04.md`, PR #28 MERGED em `d49f40f29e96f4630b282823d606acdd072c921b`; CI do PR `41851784279` com **2 checks SUCCESS**.
- **Nova tarefa selecionada:** PROMPT regular **39**, tela **V1-18 Parecer interno**, rota `/competencias/:id/parecer`. Atômicos diretos `000` BRAND-01, `021` V1-AUD-002, `022` V1-AUD-003 e `023` V1-AUD-004.
- **Contratos lidos do frontend congelado:** `pareceres_internos` via RLS, `solicitar_parecer_interno(p_id_competencia)`, `aprovar_parecer_interno(p_id_parecer,p_aprovar,p_fundamento?)`; visão geral `obter_visao_geral_competencia` com `allowed_actions.abrir_parecer`. **Nenhum backend analisado, desenvolvido ou alterado nesta retomada.**
- **Gate de PLAN:** `docs/frontend/planos/PLANO_ATIVO.json` agora descreve exclusivamente V1-18 e declara 25 fontes, 100/97, RNFs, Zero-Drift, allowlist de 7 arquivos e referência ao CI documental anterior. Estado `VALIDADO` **sujeito à aprovação do CI do PR que incorpora este checkpoint e o manifesto**. Não iniciar BUILD na branch do PLAN.
- **Próxima ação exata:** após o merge do PR de validação e CI no HEAD final, iniciar em **nova branch** o BUILD do PROMPT 39, começando por TDD RED; executar apenas allowlist, regressão, CI e Teste C independente. **NÃO** iniciar PROMPT 40/V1-19 até fechar V1-18.
- **Proibições permanentes:** `src/integrations/supabase/types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` imutável; `supabase/**`, backend, PROD, Auth, Storage, migrations, cores/brand/Design System intocados.
- **Pendências reais não falsamente aprovadas:** HML Auth/RLS A/B e fluxos mutativos com contas autorizadas; telas privadas no navegador/contraste; redação/edição manual de parecer sem RPC tipada deve ser **BLOQUEADA** até autorização de investigação backend. MOCK e CI documental não comprovam tais itens.

---

## 0. ESTADO VIVO — atualizado em 04/11/2026 após GOV-014

**Estas informações prevalecem sobre snapshots históricos mais abaixo; conferir HEADs e checks a cada novo chat.**

| Item | Última confirmação no GitHub |
| --- | --- |
| Frontend canônico | `contaos999999/contaos-hml-control`, `main` no commit `a31b852a99a753b0ea442e7d08e0d3b4e323eb6d` antes do GOV-015; **sempre conferir HEAD antes de trabalhar** |
| Backend normativo | `contaos999999/develop`, branch `main`, `cb65f4980f4eeca6ccd33caf6198a801b7e60328` (somente leitura para frontend) |
| PLAN funcional | `docs/frontend/planos/PLANO_ATIVO.json` = `SEM_PLANO_ATIVO`; não editar src/public/config sem PLAN validado e CI anterior |
| Fonte canônica | `FONTE CANÔNICA PASS`, 25 documentos e catálogo 100/97 no run do PR #14; revalidar a cada BUILD |
| LOCK-TYPES-01 | `types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, intacto |
| GOV-003 | PR #14 mesclado em `31eb0a3e7f0dca0f70420eeeab2ded1b69fcab2d`, Auto-Lock agora abre PR de reparo; não faz push direto nem merge automático |
| GOV-004 | PR #15 mesclado em `f9b46b9e07823bb291a1c5efe2a67dfd23e36727`, evidências em issue #16 e `docs/frontend/auditorias/GOV_004_CERTIFICACAO_BRANCH_2026-11-03.md` |
| Ruleset | `ContaOS-Zero-Drift-main` ID `26495643` ACTIVE, alvo `main`, 2 required checks, PR obrigatório, 0 revisões, sem bypass, sem exclusão/force push |
| Provas positivas/negativas | T02 escrita direta bloqueada HTTP 409; T03 merge com CI FAIL bloqueado HTTP 405; T04 merge PR #15 com CI verde e 0 reviews |
| Auto-Lock | GOV-011 run `41805167363` tentativa 2, `GITHUB_TOKEN` abriu PR #26 real em **branches descartáveis**, validou diff e `main`, fechou PR e limpou refs. **Drift em main não foi induzido** |
| Proteção force push/deletion | Regras ACTIVE verificadas por API, sem tentativa destrutiva real em `main` |
| HML E2E autenticado | Ainda NÃO VERIFICADO nesta linha de trabalho; evitar tocar Supabase sem autorização específica |

**Próxima tarefa funcional:** issue #6 (teste ADM-01 possivelmente flutuante) somente **se a falha for reproduzida**. A hipótese de colisão de substring `c9` com UUID não foi demonstrada: o teste atual já verifica por igualdade arrays de `p_ids_contratos_ativar/revogar`. Sem FAIL reproduzível, não alterar código funcional nem mascarar o teste; registrar evidência e investigar outras pendências de frontend. Issues #2/#5 e backend #33–#35 requerem E2E externo, não converter MOCK em PASS.

**Política permanente:** frontend GitHub, Lovable só sincronização/visualização; zero aprovações de revisão obrigatórias para PR, mas gates específicos BRAND-01 continuam. PRD 4.1, 39 etapas, 416 critérios, 100 prompts, 97 atômicos, proteção `types.ts` e ZERO-DRIFT inalterados. Sem BUILD ou inspeção de Supabase/backend/PROD neste GOV-005.


### Reavaliação GOV-006 — Lovable × GitHub (04/11/2026)

- Parecer oficial: `docs/frontend/AUDITORIA_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`, seção 7, com auditoria atualizada e preservação do histórico. Branch protection **RESOLVIDA**; Teste C Playwright **IMPLEMENTADO** no GOV-002.
- Run com navegador real `41737621829`: 184 combinações, 24 capturas, 24 PASS públicos, 152 não verificados sem sessão + 8 drawer sem sessão; contraste WCAG não medido. Artefato `13280975443` expira em **03/12/2026**. Artefatos de runs documentais marcados `Teste C N/A` não comprovam nova visualização.
- Lovable projeto `b113dd59-6caf-4c92-8302-457a037a0c6f` informa latest commit `b8ca8b99...`, GitHub estava em `79eec9b8...` antes do GOV-006. Compare confirmou **37 commits sem diff funcional em src/public**; não declarar sync atualizado no Lovable até nova verificação explícita.
- Ações futuras: mensuração de contraste WCAG e estados públicos, preservação de evidências além de 30 dias, sincronização/metadados Lovable, teste de criação PR Auto-Lock em ambiente isolado e (em projeto separado autorizado) autenticação HML A/B. Não confundir equivalência normativa com homologação 100% dos requisitos.
- GOV-006 é **somente documental**: PLAN registrado e CI validado; nenhuma mudança em frontend funcional, Supabase ou PROD.

## GOV-008 — Estado de paridade GitHub × Lovable, com provas e limites

**Referência temporal:** 04/11/2026. **Este bloco complementa a seção 0; os commits nele são baselines históricos, não instruções para ignorar o HEAD futuro.**

| Eixo | Evidência confirmada | Estado |
| --- | --- | --- |
| GOV-006 | PR #18 mesclado, SHA `bd832cda02cb2c2d1a7041020909724ae70d62f5`; parecer comparativo atualizado na seção 7 de `AUDITORIA_PARIDADE_LOVABLE_GITHUB_2026-11-03.md` | PASS documental |
| GOV-007 | PR #19 mesclado, SHA `1d4d3488b801e5a8c30875b8588e7cc80063558a`; auditoria WCAG instrumentada `axe-core@4.14.0` no Teste C Playwright | PASS de implantação |
| TDD e CI GOV-007 | TDD RED `41767892283`; CI com navegação real `41768441317`; CI do SHA final `41769282629` com ambos os jobs SUCCESS | PASS no escopo testado |
| Teste C público WCAG | 184 combinações; 24 testes públicos com 0 regras de violação automática confirmadas, mas `color-contrast` **INCOMPLETE em 24/24** (12 nós por combinação); 160 casos protegidos sem sessão | PASS somente no escopo público com contraste NÃO VERIFICADO e HML NÃO VERIFICADO |
| Artefato novo | Actions `13294825132` (`41769282629`), prazo confirmado até `02/02/2027`; evidências sob hash `SHA256SUMS` | Retenção de 90 dias, **não arquivo permanente** |
| Hash de código funcional | SHA Git `src`: `34f9be40ac4167867b0b89362b00e02557eaa95a`; `public`: `7f72da43b4a4fbd669ca1e900a773bc18f89845b`; package `6dbe973df8f2fb6c45ef4cf544c99fbbb5141713`; lock `17b4d9861dba2e5edef0bb0933d3ab2d8daffea0`. Iguais entre commit informado pelo Lovable `b8ca8b99...` e GitHub antes do GOV-007 | Equivalência **bit a bit destes artefatos** comprovada |
| Lovable | Knowledge do projeto `b113dd59-6caf-4c92-8302-457a037a0c6f` atualizado somente nos caminhos de `contaos999999`, sem BUILD. API Lovable continua informando `latest_commit_sha=b8ca8b99...` | Metadados de sync NÃO VERIFICADOS no SHA GitHub atual |
| Auto-Lock | Executado sem drift (`41762615464`), restauração por fixture validada | Abertura **real** de PR por drift NÃO TESTADA |
| Ruleset | `26495643` ACTIVE, PR obrigatório, checks obrigatórios, 0 revisões, sem bypass; rejeição real de push direto/merge com CI negativo | PASS principais; força/exclusão confirmadas por configuração, não ensaio destrutivo |
| Backend real | Supabase HML A/B, Auth, recuperação de senha, gravação/upload sem homologação nesta trilha | NÃO VERIFICADO |
| WCAG manual | Revisão de contraste inconclusivo, foco/teclado/leitor de tela e telas protegidas | NÃO VERIFICADO |

**Decisão de qualidade:** não declarar equivalência operacional integral nem 100% do PRD 4.1 enquanto faltarem as provas acima. Não alterar o frontend visual para fazer o teste passar sem PLAN específico de BRAND-01. Não interpretar CI administrativo com `Teste C N/A` como prova de navegação. Nenhum teste HML ou PROD foi executado no GOV-006/007/008.

**Próximos saneamentos prioritários:** medir e revisar manualmente os elementos `color-contrast` inconclusivos (sem suprimir falhas); homologar telas autenticadas e fluxos A/B apenas com credenciais autorizadas; arquivar evidências institucionalmente antes de `02/02/2027`; comprovar caminho real do Auto-Lock em ambiente isolado; validar atualização dos metadados do Lovable sem usar sua IA para BUILD. Antes de qualquer BUILD, reler `PLANO_ATIVO.json`, documentos normativos, ISSUE, HEADs e gates do CI.

## GOV-015 — Provas encerradas de Auto-Lock, Lovable e contraste público

**Registro verificado em 04/11/2026.** Este bloco prevalece sobre pendências antigas do GOV-006/GOV-008 que descreviam o bot como incapaz de abrir PR, a sincronização Lovable como quebrada, ou os 120 contrastes públicos como ainda não mensurados. Essas referências anteriores permanecem como histórico de fatos na época. Nenhum desses resultados homologa o backend HML ou a WCAG integral.

| Ponto | Prova concreta | Situação e limite |
| --- | --- | --- |
| **GOV-011 Auto-Lock** | GitHub Actions `41805167363` tentativa 2, job `126606923195` **SUCCESS**. O bot criou `autolock/probe-drift-41805167363-2` e `autolock/probe-repair-41805167363-2`, abriu o **PR #26** com `github-actions[bot]`, verificou diff apenas de `types.ts` e o SHA da `main`, fechou o PR sem merge e removeu as duas branches | **PASS de abertura automática de PR de recuperação em cenário isolado**. Não houve corrupção real da `main`; não confundir com prova de incidência real |
| **Sincronização GitHub → Lovable** | Após o GOV-014, GitHub `main` e Lovable projeto `b113dd59-6caf-4c92-8302-457a037a0c6f` retornaram o mesmo SHA `a31b852a99a753b0ea442e7d08e0d3b4e323eb6d`. Conteúdos de `docs/frontend/auditorias/GOV_014_MEDICAO_CONTRASTE_2026-11-04.md`, `scripts/testc/visual-audit.mjs` e `src/routes/login.tsx` foram comparados: idênticos após remover somente o newline final omitido pela API Lovable | **PASS de sincronização no SHA verificado**. Repetir conferência de SHA e conteúdo após novos merges; Lovable é só visualizador, sem IA BUILD |
| **GOV-014 WCAG AA, contraste público** | PR #25 mesclado SHA `a31b852a99a753b0ea442e7d08e0d3b4e323eb6d`; CI `41840128303` **SUCCESS nos dois jobs**. 120/120 elementos públicos anteriormente `INCOMPLETE` obtiveram **PASS_AA_PIXEL**, zero FAIL, zero sem amostra, razão mínima **4,7465:1** diante do mínimo 4,5:1 para texto normal; 24/24 cenários públicos PASS, 184 combinações totais | **PASS do contraste nesses elementos, quatro larguras e dois temas**. `axe-core` ainda marca detecção automática `INCOMPLETE`; prova suplementar foi por pixels do fundo renderizado. **160 combinações protegidas seguem NÃO VERIFICADAS** |
| **Evidência GOV-014** | Run `41840128303`, artifact `13328683000` (retido até 02/02/2027); ZIP `ContaOS_GOV014_Pixel_41840128303.zip`, SHA256 `5d452e5c1ba515384c352ccbbd133cda5824a8b3e88b56383f4fcc167d7fba37`, CRC PASS e **25/25 hashes internos válidos** | **Integridade verificada**; retenção Actions de 90 dias não equivale a armazenamento institucional imutável |

**Próxima frente que permanece pendente:** homologação autenticada HML A/B, upload, reset de senha e demais verificações de 160 cenários protegidos; fluxos de teclado/foco/leitor de tela e estados dinâmicos para WCAG total. Não usar os 120/120 elementos públicos para declarar 100% de todos os 416 critérios do PRD 4.1.

**Governança:** `main` protegida pelo ruleset `26495643`, PR com dois checks e zero revisões obrigatórias; `types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` preservado. Nenhuma alteração de backend, PROD, estilos, UI, marca BRAND-01, assets ou código funcional neste checkpoint. Para continuar, ler este documento, `AGENTS.md` e PLAN ativo, consultar HEADs e CI correntes, e jamais presumir que o SHA histórico continua atual.

## ADR-DEV-002 — validação obrigatória antes de qualquer BUILD

**GATE BLOQUEANTE:** usar [ADR-DEV-002](ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md). Em cada prompt: **PROMPT → PLAN → VALIDAÇÃO → commit isolado do PLAN e CI aprovado → BUILD somente frontend via GitHub → CI/Zero-Drift → Teste C independente somente leitura → dossiê → novo checkpoint**. Sem `docs/frontend/planos/PLANO_ATIVO.json` previamente VALIDADO, proibido editar `src/`, `public/` ou configuração do app. Backend `contaos999999/develop` e Supabase não entram em uma tarefa frontend. Aprovação humana específica permanece obrigatória quando o pacote exigir.

## Quando houver suspeita de lacuna no backend

O desenvolvimento permanece **somente frontend**. Documentar o sintoma com provas do frontend e **pedir autorização ao responsável ANTES de passar ao fluxo do repositório `contaos999999/develop` para analisar Supabase HML**. Autorizada a investigação, checar backend read-only; se confirmada lacuna real, PROMPT backend → PLAN → gate validado → BUILD limitado HML → testes e certificação → GitHub → **retorno ao frontend**. Sem aprovação explícita, não investigar nem modificar backend. PRD, Premissas, prompts 00–99 e 000–096, NFRs, BRAND-01, auditoria/fontes e Zero-Drift continuam absolutos.

## Verificação canônica de paridade antes de abrir novo PROMPT

- Verificar SHA HEAD atual do repositório normativo `contaos999999/develop`; confrontar `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` (25 documentos) e `docs/prompts/PROMPT_TRACKS_4_1.json` (100 regulares / 97 atômicos). Divergência de fonte = PLAN BLOQUEADO até atualização controlada do snapshot.
- Exigir manifesto `PLANO_ATIVO.json` VALIDADO, leitura declarada das fontes, origem SHA e cláusula literal Zero-Drift §11.3 no PLAN. Não basta CI verde de código.
- CI verifica aprovação prévia e allowlist, inclusive branch PR. **Teste C real/screenshot/contraste, autorização HML A/B e branch protection não são substituídos por esse gate de texto**.
- Fonte do saneamento documental: `docs/frontend/planos/GOV_001_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`.

## 1. Regra de retomada: nunca recomeçar nem adivinhar

No **primeiro turno de todo novo chat**, acessar pelo conector GitHub:
- Frontend (código canônico): https://github.com/contaos999999/contaos-hml-control
- Backend, governança e dossiês: https://github.com/contaos999999/develop
- Este arquivo: https://github.com/contaos999999/contaos-hml-control/blob/main/docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md
- Fonte oficial dos 416 critérios: https://github.com/contaos999999/develop/blob/main/docs/prompts/CRITERIOS_ORIGINAIS_39_PROMPTS_2026-11-03.json
- Matriz de prova (39 × 416): https://github.com/contaos999999/develop/blob/main/docs/prompts/MATRIZ_416_CRITERIOS_STATUS_E_PROVAS_2026-11-03.json
- Tracker: https://github.com/contaos999999/develop/blob/main/docs/prompts/PLANO_SANEAMENTO_39_PROMPTS_2026-11-03.json
- Dossiês dos PROMPTs 00–38: https://github.com/contaos999999/develop/tree/main/docs/prompts/evidencias_individuais
- ADR oficial: `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md` e `AGENTS.md`.

**Obrigatório:** verificar HEAD da branch `main` de ambos os repositórios, commits recentes, diff desde último checkpoint, CI do SHA atual, issues abertas e hash do `types.ts`. **O estado real dos repositórios tem precedência sobre o snapshot desta página e sobre a memória do chat.** Não atualizar o backend pela IA Lovable.

## 2. Snapshot de início — 03/11/2026

| Área | Identificação e estado |
| --- | --- |
| Frontend | `contaos999999/contaos-hml-control`, branch `main`; HEAD verificado antes da ADR: `174512a2d2cc978f9c04da54bd8096ad2e47408d` (o SHA **muda** com este documento) |
| Backend/documentação | `contaos999999/develop`, branch `main`; último HEAD observado: `75a62cce775989017c7723b9206b3358161b40a3` |
| Supabase HML | Projeto `gklhhhyosgasnyoxlrui`; PROD proibido |
| Lovable, somente visualização/sincronização | Projeto `b113dd59-6caf-4c92-8302-457a037a0c6f`; https://lovable.dev/projects/b113dd59-6caf-4c92-8302-457a037a0c6f |
| Tipos Supabase | `src/integrations/supabase/types.ts` bloqueado no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` |
| Auto-Lock | Regeneração indevida do Lovable foi **reparada automaticamente**, workflow https://github.com/contaos999999/contaos-hml-control/actions/runs/41725182728 |
| CI frontend | Último SHA imutável auditado sem alteração funcional `c36c9c817ec97948885acbf8330181d6a7e325e9`, CI SUCCESS https://github.com/contaos999999/contaos-hml-control/actions/runs/41720206213. Push do Lovable com types divergente `4f8326...` teve CI FAIL https://github.com/contaos999999/contaos-hml-control/actions/runs/41725182737 **antes do Auto-Lock**; o commit do bot restaurou o arquivo, mas deve ser verificado novo CI conforme a regra. |
| CI backend | `75a62cce775989017c7723b9206b3358161b40a3` SUCCESS https://github.com/contaos999999/develop/actions/runs/41726627573 |
| Inventário | **39 prompts** `00–38` e **416 critérios** originais; **não há documentação de 49 itens**. Não inventar dez pendências. |
| Provas parciais | 15 prompts de backend têm migrations aplicadas e RLS presente; HML: 117/117 tabelas públicas RLS, 183 policies. Matriz registra **36 gates com PASS delimitado** e **69 gates de responsividade com evidência visual MOCK**; nenhuma certificação integral universal. |
| Frontend | 23 telas SYS01–ADM01 e V1-01–V1-17 implementadas; 812 testes em 28 arquivos no CI aprovado do SHA `ad0b933...`. Teste C visual reportou **23/23 sem falha**, 184 capturas base + 70 extras (**254**), todas originais efêmeras em `/tmp`, sem pacote de imagens durável. |
| Segurança e autenticação | E2E de dois tenants **não executado**; HML tinha quatro organizações, **zero contratos** e **um usuário com vínculo ativo**. A recuperação SYS-03 com e-mail real também não foi testada. |
| PROD | Nenhuma alteração aprovada/realizada nesta linha de trabalho. |

## 3. Pendências documentadas, sem fingir encerramento

- Frontend: https://github.com/contaos999999/contaos-hml-control/issues/6 — teste flutuante ADM-01; https://github.com/contaos999999/contaos-hml-control/issues/2 — E2E ADM-01; https://github.com/contaos999999/contaos-hml-control/issues/5 — E2E cadastro contratante.
- Backend/governança: https://github.com/contaos999999/develop/issues/33 — SYS03 e-mail real; https://github.com/contaos999999/develop/issues/34 — arquivar 254 capturas e contraste WCAG; https://github.com/contaos999999/develop/issues/35 — duas identidades HML e contratos de teste para RLS A/B.
- Seis WARN de SECURITY DEFINER requerem verificação contextual de acesso, não revogação automática. Proteção contra senha vazada desabilitada no Auth requer painel administrativo/credenciais.
- Teste C com dados MOCK **não** homologa controles de acesso reais nem leitura/escrita efetiva. Qualquer evidência externa que não estiver acessível deve ser rotulada NÃO VERIFICADA.
- Toda correção frontend deve ser feita **no GitHub, sem BUILD do Lovable**. O Lovable pode continuar regenerando `types.ts` internamente; conferir sempre o blob e o Auto-Lock.

## 4. Próxima ação padrão para continuar automaticamente (avaliar após estado vivo do item 0)

1. Conferir HEADs, diffs, CI, issues e dossiês. Não repetir implementações já presentes.
2. Escolher a pendência **comprovada e solucionável diretamente**, por exemplo estabilizar o teste ADM-01 da issue #6 após reproduzir sua falha; sem inventar defeito. Fazer correção mínima por GitHub, TDD e CI, atualizar dossiê e issue.
3. Paralelamente preparar evidências duráveis e ensaios visual/segurança que não necessitem de terceiros. Para A/B, E2E de e-mail e funções administrativas restritas, documentar a condição externa e pedir apenas a intervenção indispensável, sem expor segredos.
4. Antes de encerrar cada bloco: atualizar **este documento**, tracker, matriz e dossiês pertinentes, com SHA real, status de CI, testes, ações e impedimentos. Manter registros históricos, não substituir evidência antiga por aprovação artificial.

## 5. Texto pronto para colar no novo chat

> Continue o projeto ContaOS 4.1 **de onde parou**, sem reiniciar nem presumir o contexto antigo. A decisão oficial **ADR-DEV-001** estabelece frontend corrigido/programado **diretamente no GitHub** `contaos999999/contaos-hml-control`, backend **somente Supabase HML** `gklhhhyosgasnyoxlrui` e Lovable **somente sincronização/visualização**. Primeiro leia `AGENTS.md`, `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md` e `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` no GitHub frontend, depois o tracker das 39 etapas, os 39 dossiês, a matriz dos 416 critérios e as issues abertas no `contaos999999/develop`. Confira os HEADs e CI atuais antes de qualquer mudança. Nunca altere PROD, não regenere `types.ts` (blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`), respeite o PRD 4.1, BRAND-01, Zero-Drift, TDD, Teste C e rastreabilidade. Resolva autonomamente a próxima pendência concreta, com correção, testes, commit e evidências por prompt, e atualize o checkpoint. Só me consulte se houver bloqueio real não solucionável.

## 6. Segurança da passagem entre chats

- Não colar secrets, tokens, JWT, senhas, links de redefinição, envs privados ou dados de pacientes/contratos no prompt de retomada.
- O novo chat pode não receber todo o histórico anterior; por isso deve se apoiar nos documentos versionados.
- O agente não trabalha em background entre chats: após abrir a nova conversa, envie o texto da seção 5. O trabalho segue **naquele turno**.
- O snapshot acima é um **ponto de partida**, não fonte eterna de verdade. A cada retomada e conclusão, registrar novas evidências e SHA atualizado.


> **REGRA DE RETOMADA ADR-DEV-002**: antes de corrigir qualquer frontend, ler `docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md` e `docs/frontend/planos/PLANO_ATIVO.json`; realizar PROMPT → PLAN → validação (com gate registrado em commit + CI) → BUILD apenas frontend → CI → Teste C independente. Nenhuma alteração de backend, Supabase, migrations, RLS, RPC, Storage, Auth, Edge ou PROD. Caso fora de escopo, parar e comunicar.

> **OBSERVAÇÃO DE AUTORIZAÇÃO BACKEND:** se identificar possível lacuna backend, no novo chat solicitar permissão específica antes de acessar o fluxo `contaos999999/develop` para confirmar. Nunca interpretar instruções gerais de continuidade como essa permissão.


## 03/11/2026 — Auditoria de paridade Lovable × GitHub e reforço do gate
- Parecer: `docs/frontend/AUDITORIA_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`.
- PLAN documentado: `docs/frontend/planos/GOV_001_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`, CI https://github.com/contaos999999/contaos-hml-control/actions/runs/41732038105 **SUCCESS**.
- BUILD exclusivo de governança frontend: commit `21416e1685f00344cd7e8e790a507fbfed3a53cc`, 13/13 testes do guard, 812/812 Vitest, lint/TS/build/Zero-Drift CI https://github.com/contaos999999/contaos-hml-control/actions/runs/41733336741 **SUCCESS**.
- Fontes canônicas `00–20 + 08A–08D`: snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`; crosswalk 100 regulares, 97 atômicos, mas não 100% execução.
- Lovable sincronizado ao mesmo SHA `21416e1685f00344cd7e8e790a507fbfed3a53cc` em consulta realizada após o CI; autor de frontend = GitHub, Lovable não usado em BUILD.
- Backend `contaos999999/develop` não alterado, HEAD `cb65f4980f4eeca6ccd33caf6198a801b7e60328`; types blob certificado. `PLANO_ATIVO.json` ainda `SEM_PLANO_ATIVO`.
- PENDENTE no snapshot de 03/11: Teste C independente durável, HML A/B e branch protection. **Atualização posterior GOV-004 no item 0: proteção da main já comprovada, e Teste C independente existe, mas os estados autenticados E2E permanecem não verificados.**
- Próxima tarefa funcional frontend exige novo PLAN validado, CI prévio e allowlist; **não modificar Supabase sem autorização humana específica**.

## GOV-002 — Quatro controles de equivalência Lovable → GitHub

- **Branch exclusiva de governança:** `governance/quatro-gates-20261103`, PR #11 https://github.com/contaos999999/contaos-hml-control/pull/11. PLAN `docs/frontend/planos/GOV_002_QUATRO_GATES_2026-11-03.md`, commit somente documental `fa872871eb25472a55366bcc20d4752fb172497a`, CI do PLAN https://github.com/contaos999999/contaos-hml-control/actions/runs/41735578730 SUCCESS.
- **Teste C:** `.github/workflows/contaos-teste-c-independente.yml`, runner `scripts/testc/visual-audit.mjs` e teste unitário. 23 telas × 4 larguras × 2 temas; acesso sem credenciais; PNG somente públicos e estados de negação, hashes e relatórios em artifact por 30 dias. Sem sessão real, drawer e autorização A/B continuam NÃO VERIFICADOS. Como executar: `docs/frontend/GUIA_TESTEC_E_FONTES_2026-11-03.md`.
- **Fonte viva:** `scripts/context-freshness-gate.mjs`, verificação de HEAD/25 documentos/catálogo 100/97. O titular precisa configurar Secret `CONTAOS_CANONICAL_READ_TOKEN` read-only, restrito ao repositório normativo `develop`. Sem isso, BUILD funcional deve FAIL fechado. **A fonte normativa não foi alterada**.
- **Proteção de branch no histórico GOV-002:** precisava de admin e Auto-Lock compatível. **Situação atual: ruleset ACTIVE, sem bypass e checks obrigatórios (GOV-004, item 0).**
- **HML real:** `docs/frontend/HML_E2E_PRECONDICOES_2026-11-03.md`; nenhuma conta/contrato/arquivo criado, autorização específica pendente antes de qualquer teste de escrita, inspeção do backend ou acesso a dados.
- **Intocáveis:** `src/**`, `public/**`, `package.json`, `bun.lock`, `types.ts` certificado, todos os objetos Supabase HML, repositório `contaos999999/develop` e PROD. Retomar frontend funcional somente com PLAN por prompt 00–99 + atômicos 000–096 e CI/BRAND-01/Zero-Drift.

## Atualização GOV-003 — 03/11/2026 (registro histórico anterior ao merge do PR #14)
- Organização GitHub conectada: `contaos999999`. Frontend `contaos999999/contaos-hml-control`; repositório normativo `contaos999999/develop` (somente leitura).
- PLAN GOV-003: `docs/frontend/planos/GOV_003_RULESET_AUTOLOCK_CANONICO_2026-11-03.md`; PR de governança rascunho #14, sem merge e sem modificação de backend/PROD.
- Auto-Lock planejado por branch+PR com CI obrigatório e **0 revisões humanas obrigatórias** por decisão do titular; não fazer bypass da proteção da main. Verificar permissões Actions e checks reais de CI após BUILD.
- O secret `CONTAOS_CANONICAL_READ_TOKEN`, enforcement do ruleset, regras de branch sem revisão humana obrigatória e E2E autenticado A/B são **NÃO VERIFICADOS** enquanto não houver evidência direta. O backend e os dados HML permanecem intocados.

### Decisão de governança do titular — 03/11/2026
- O titular optou por operar a organização com um único colaborador e **Required approvals = 0** no ruleset. Exigir PR, checks verdes, bloquear exclusão/force push, nenhuma exceção ampla de bypass. Não inventar evidência de aprovação humana. Aprovações excepcionais previstas para modificações sensíveis BRAND-01/escopo específico permanecem gates distintos.
- A restauração de types.ts não poderá fazer push direto na main; o bot abre PR, solicita CI e não executa merge automaticamente. O merge pelo titular não requer segundo revisor, mas só é permitido com CI e regras efetivas.
- HML A/B fora do escopo desta tarefa a pedido do titular; não executar testes do Supabase.

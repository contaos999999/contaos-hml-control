## CHECKPOINT P0 — 05/11/2026 03:56 America/Bahia — PR #108, foco móvel

- PR #108 `build/p0-sidebar-mobile-focus-v1`: HEAD anterior `4936223b5295e48748d98d1236177fe9564c1b71`, run `41980265900`: Zero-Drift FAILURE (TypeScript TS18048 em `ContaOSAppShell.tsx`, variáveis `primeiro` e `ultimo` possivelmente indefinidas); Teste C SUCCESS. **Não houve merge desse HEAD falho.**
- Correção aplicada na mesma branch, commit `0f1068736c7d94759c5fe8d6d462d5206f23fc4c`: chamadas de foco com optional chaining, preservando a navegação Tab/Shift+Tab e o fechamento por Esc. Novo run `41983831986` IN_PROGRESS na última consulta; requer ambos os jobs SUCCESS no mesmo HEAD antes de merge.
- PR #80 GATE: MERGED, run `41950160697` SUCCESS. PR #77 RED OPEN, run `41949536167` FAILURE (gate de fronteira/PLAN); #78 BUILD OPEN, run `41949684490` FAILURE (gate e Teste C); #86 ADM-01 OPEN, run `41956036853` FAILURE (gate). Nenhum dos três está liberado para merge.
- Normas P0 de ambos repositórios consultadas; sequência V1 certificada antes de V2, 100 regulares e 97 atômicos mantida. Índice ZIP canônico consultado, ZIP literal ainda não recuperado nesta execução.
- **Pendências de certificação:** autenticação e isolamento reais em HML, upload/worker, auditoria visual em quatro larguras e dois temas, contraste WCAG 2.2 AA, teclado/leitor de tela, evidências arquivadas e retrospectiva. V1 NÃO CERTIFICADA; V2 BLOQUEADA; PROD INALTERADA.
- Próxima ação: reconsultar run `41983831986`; se dois jobs SUCCESS no HEAD corrigido, revisar/merge protegido do PR #108; caso contrário ler logs e corrigir. Depois avançar testes HML e evidências.

---

## CHECKPOINT P0 — 05/11/2026 02:13 (America/Bahia): SIDEBAR E SESSÃO

Consulta viva dos PRs e jobs no mesmo HEAD, sem inferir homologação operacional:

- PR #99 (sidebar/AppShell) MERGED, HEAD `fc303514aca465af18a638c830de34201dc57882`, CI 41964388882 SUCCESS.
- PR #101 (BRAND-01, deduplicação responsiva) MERGED, HEAD `9e3b7a51edcffd6801d63d6936602b818f285351`, CI 41968405315 SUCCESS, merge `9fb223a1d6b20f39345e249bfbbac5adbf63138e`.
- PR #102 (checkpoint) MERGED, HEAD `32f6f567fc55deacd09522b6edeaf14a9345f12a`, CI 41968464688, **Zero-Drift SUCCESS e Teste C SUCCESS**, merge `6c66bd6f676cb66e77d9b958cc3027ddc5b37fe7`.
- PR #103 (invalidação visual de sidebar em mudança de sessão) MERGED, HEAD `35ffe59d5e90d5da9a9922530f95ff24f97578f0`, CI 41969133467, **Zero-Drift SUCCESS e Teste C SUCCESS**, merge `c5845a871c6a90854bfcfec50b0692912e351450`.
- PRs #77 (RED, HEAD `50ed95552094fe53e2c45fd1535ad16eb9dd79d9`, run 41949536167 FAILURE), #78 (BUILD, HEAD `f44a33165e71a0ef35a2ce9ae8fa094bc5cfc261`, run 41949684490 FAILURE) e #86 (ADM-01, HEAD `1b488b20f4f2ec54e8b66800c68c7ac47e2572e5`, run 41956036853 FAILURE) continuam OPEN. **Não mesclar** sem reconciliação normativa, novo HEAD e dois checks SUCCESS. #80 GATE, #83 BUILD e #87 emenda já integrados.
- O checkpoint anterior dizia que sidebar/AppShell não existiam na main. Essa afirmação está **superada** pelos merges #99/#101/#103; componentes existem, mas operação autenticada HML e acessibilidade integral não foram certificadas.
- Fonte canônica: índice do ZIP consultado; arquivo ZIP literal não reaberto nesta execução. Nenhuma mudança em PROD.

**Próximo passo P0:** verificar teste real HML com sessão, autorização administrativa, isolamento entre organizações/usuários, upload e worker ponta a ponta; auditar WCAG 2.2 AA, quatro larguras e dois temas com evidência visual, arquivar artefatos permanentes, reconciliar PRs legados e executar retrospectiva. Não certificar V1 nem avançar V2 sem evidência.

---

## CHECKPOINT P0 — 05/11/2026, CI e sidebar

- PR #99 sidebar/AppShell: MERGED, HEAD `fc303514aca465af18a638c830de34201dc57882`, workflow `41964388882` SUCCESS; não equivale a certificação funcional HML.
- PR #100 reconciliação: MERGED, HEAD `4fe3970afc2ef3b8ca53507040ab036d90de2ee7`.
- PR #101 cabeçalhos: OPEN na última consulta, HEAD `9e3b7a51edcffd6801d63d6936602b818f285351`; workflow `41968405315` PENDING. O workflow anterior `41966737195` falhou em testes BRAND-01 que exigem `ContaOSMarca` nas telas. O novo HEAD restaurou a presença do componente nas quatro telas, mas os novos checks ainda não foram concluídos. Não mesclar sem dois jobs SUCCESS no mesmo HEAD.
- PR #77 RED: OPEN, HEAD `50ed95552094fe53e2c45fd1535ad16eb9dd79d9`, CI `41949536167` FAILURE (Zero-Drift FAIL, Teste C SUCCESS).
- PR #78 BUILD: OPEN, HEAD `f44a33165e71a0ef35a2ce9ae8fa094bc5cfc261`, CI `41949684490` FAILURE nos dois jobs.
- PR #86 ADM-01: OPEN, HEAD `1b488b20f4f2ec54e8b66800c68c7ac47e2572e5`, CI `41956036853` FAILURE (Zero-Drift FAIL, Teste C SUCCESS).
- PR #80 GATE, #83 V1-23 BUILD, #87 emenda e #98 PLAN sidebar: MERGED, conforme histórico; sem autorizar merge de branches legadas falhas.
- Fonte literal: índice do ZIP canônico consultado; ZIP não reaberto nesta execução, portanto sem nova validação literal de seu conteúdo.
- Próximos passos: conferir CI do PR #101 e, se ambos SUCCESS, revisar diff e integrar conforme proteções; resolver compatibilidade entre BRAND-01 e eliminação de duplicidade visual sem suprimir teste; testar sessão real, permissões, isolamento, upload/worker, teclado/foco, quatro larguras, dois temas e contraste WCAG; atualizar retrospectiva. V1 NÃO CERTIFICADA, V2 BLOQUEADA, PROD INALTERADA.

---

## ATUALIZAÇÃO DE RETOMADA — V1-23 E SIDEBAR (05/11/2026)

Consulta GitHub desta execução, sem presumir sucesso operacional:

- **PR #75 PLAN V1-23:** merged; HEAD `19d14e0d649889f839bea18b71e952e68b3f5ffc`; workflow 41948962744 SUCCESS.
- **PR #80 GATE corrigido:** merged; HEAD `aa3868c34d3fa2ba9f1b382380da51766c4542e5`; workflow 41950160697 SUCCESS.
- **PR #87 emenda ADM-01:** merged; HEAD `61a8523fa3c5dcf35749a10a569b8a2c226ee049`; workflow 41956515190 SUCCESS.
- **PR #83 BUILD V1-23:** merged; HEAD `e4df6316b244a143c9b9dbf1de682104fecd26c1`; workflow 41959012094 SUCCESS. A integração não certifica automaticamente HML/autorização.
- **PRs legados #77 RED e #78 BUILD:** permanecem OPEN, workflows 41949536167 e 41949684490 FAILURE. Não mesclar sem novo HEAD e dois jobs SUCCESS; verificar obsolescência e fechar com justificativa, se comprovada, em vez de contornar gates.
- **PR #86 correção ADM-01:** OPEN, HEAD `1b488b20f4f2ec54e8b66800c68c7ac47e2572e5`, workflow 41956036853 FAILURE: Zero-Drift FAILURE, Teste C SUCCESS. Não mesclar sem correção e novos checks.
- **PR #96 conferência normativa:** merged, HEAD `e56376a719f717380b2411719075a8dcad64fa41`, workflow 41962351779 SUCCESS.
- **PR #97 gates documentais:** merged, HEAD `dcc0328ad180d0b13428fbd880182a92667919ef`, workflow 41962457399 SUCCESS.
- **PR #98 PLAN sidebar:** merged, HEAD `7942833316620b1b1334a1ccd6793fd87bd5574d`, workflow 41962851627 SUCCESS, com **ambos os jobs** Zero-Drift e Teste C SUCCESS. `PLANO_ATIVO.json` está VALIDADO exclusivamente para planejamento; não é evidência de BUILD.
- **Sidebar/AppShell:** `src/routes/__root.tsx` ainda renderiza `<Outlet />` diretamente; `src/components/layout/ContaOSAppShell.tsx` e `ContaOSSidebar.tsx` não existem em `main` na consulta. Portanto **não implementada**. PLAN aprovado não equivale a código funcional.
- **Rastreabilidade:** regular 75 corresponde literalmente à Trilha de Auditoria V1-23; o PLAN da sidebar usa o mesmo ID como âncora estrutural transversal, sem autorização para reinterpretar a funcionalidade original. Manter trilha separada de correção transversal e não contar a sidebar como novo prompt regular.
- **Fonte ZIP:** índice `docs/frontend/governanca/INDICE_LOCALIZACAO_PACOTE_MESTRE_4_1.md` fornece nome, SHA-256 e caminhos internos, mas o arquivo ZIP original não foi reaberto nesta execução; não afirmar conferência literal nova.
- **Próxima tarefa:** implementar sidebar/AppShell em branch BUILD própria, com testes RED anteriores, respeitando allowlist do PLAN e autorização real por sessão/organização/ADM; verificar quatro larguras, dois temas, WCAG, marca transparente, Teste C e CI no mesmo HEAD. Reconciliar PRs legados, testar HML real e atualizar certificado V1. **V1 NÃO CERTIFICADA, V2 BLOQUEADA, PROD INALTERADA.**

---

# ContaOS 4.1 — Estado vivo e protocolo de retomada entre chats

**Canal oficial de continuidade.** Documento de referência para quando uma conversa acabar, precisar trocar de chat, houver perda parcial do histórico ou outra pessoa/instância assumir o trabalho. **Atualizar o checkpoint ao terminar qualquer bloco de correções.**


## CHECKPOINT OFICIAL — PROMPT 43/V1-22 BUILD INTEGRADO; V1 NÃO CERTIFICADA (04/11/2026, Brasília)

**Estado integrado COMPROVADO:** frontend `contaos999999/contaos-hml-control/main@99e6fe9cb1b80cdd841665f781d48a0b3406233a`, [PR #73](https://github.com/contaos999999/contaos-hml-control/pull/73) MERGED. Fonte normativa `contaos999999/develop/main@c2bf86d011da6bfd3abaa70de38e7a722ae629de`, snapshot idêntico **25/25**, catálogo **100 regulares / 97 atômicos**. Verificar os HEADs vivos em nova sessão.

- **PLAN/GATE:** PLAN [PR #71](https://github.com/contaos999999/contaos-hml-control/pull/71), merge `a3d1f65e2af235166d5d0d68ffe227a5877959e8`, CI [41940708299](https://github.com/contaos999999/contaos-hml-control/actions/runs/41940708299) ambos SUCCESS; GATE [PR #72](https://github.com/contaos999999/contaos-hml-control/pull/72), merge `4845360566ed9ef04961399af6b15aff31f32ddc`, CI [41941072662](https://github.com/contaos999999/contaos-hml-control/actions/runs/41941072662) ambos SUCCESS. `PLANO_ATIVO.json` permaneceu 43 VALIDADO durante BUILD, sem salto de versão.
- **TDD/BUILD:** TDD RED real commit `7bcb85a29795d43454ad36fe68cae2eaf06b3c87`, CI [41941375439](https://github.com/contaos999999/contaos-hml-control/actions/runs/41941375439) falha esperada por módulo novo ausente (856 anteriores PASS). BUILD [PR #73](https://github.com/contaos999999/contaos-hml-control/pull/73) final `405266439d01d271dfaecaf4886e3859c41feb2f`, merge `99e6fe9cb1b80cdd841665f781d48a0b3406233a`. **CI definitivo [41943470748](https://github.com/contaos999999/contaos-hml-control/actions/runs/41943470748): dois checks SUCCESS no mesmo SHA**, 865/865 Vitest em 33 arquivos; TypeScript/build/BRAND-01/Zero-Drift/GOV-020/tipos imutáveis/25 fontes PASS.
- **Teste C independente final:** `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA` com **28 superfícies × 4 larguras × 2 temas = 224 combinações, 24 capturas**. Artifact `contaos-teste-c-41943470748-1` ID `13377257708`, digest `sha256:65b7fadf60126d1848950f0c246f1511f2a0231ef909402d3a53f6325b37ceb9`; expira **03/02/2027**. Binários **não têm arquivamento permanente comprovado**, embora o dossiê versionado seja persistente. Dossiê `docs/frontend/auditorias/PROMPT_43_V122_TESTES_2026-11-04.md`.
- **Recurso agora integrado:** rota `/contratos/:id/historico/importar` e link no Histórico; seleção múltipla, envio sequencial, competências e tipos, Storage certificado, hash, versionamento, estado segurança/documentos, fila histórica via RPC, respostas/desfechos por RPC gestão, listagem paginada até além dos 25 primeiros, proteção contra dupla submissão, mensagens em português brasileiro. `routeTree.gen.ts` blob `643c4fab26022ab59028d7298607970180fa64bb` **igual à geração TanStack oficial**; nenhum backend, migrations, RLS, Auth, Edge, Storage, PROD, CSS global, logo ou `types.ts` modificado.
- **EXCEÇÕES EXPRESSAS DO TITULAR, NÃO VERIFICADAS:** (1) upload real autenticado; (2) worker histórico real ponta a ponta; (3) isolamento operacional entre usuários/organizações. Os três testes não foram realizados, não são PASS. Testes de lote/perfil são mocks e não provam HML real.
- **Limitação arquitetural conhecida:** parser do worker histórico utiliza marcadores textuais explícitos; documentos sem marcadores podem não originar apontamentos automaticamente, com revisão humana necessária. Essa cobertura não está certificada, e não se inventam resultados. A criação de regra preventiva vinculante exige governança e aprovação humana, sem bypass no frontend.
- **PRÓXIMO PASSO P0:** após integração deste checkpoint e atualização do recibo `P0_ORDEM_POR_VERSAO_4_1.json`, iniciar PLAN do **regular 75/V1-23 — Trilha de auditoria**. Depois executar auditoria retroativa dos regulares 00–42, requisitos 001–024, BRAND-01 e NFRs antes do certificado da V1. **V1 AINDA NÃO CERTIFICADA; V2 BLOQUEADA; PROD NÃO AUTORIZADA.** Não repetir etapas 42 ou 43 comprovadamente integradas, salvo correção fundamentada e novo PLAN.

---

## DECISÃO CONDICIONAL DO TITULAR — NÃO CERTIFICAR V1-22 ENQUANTO HOUVER OUTRAS LACUNAS (04/11/2026)

O titular autorizou certificação com ressalvas **somente se** as únicas pendências fossem fluxo real de upload, processamento por worker e isolamento entre usuários. Auditoria ao `main@070ed2dccf7cd6410f70f500d7bde9464bf5fb77` constatou **outras pendências relevantes**: rota `/contratos/:id/historico/importar` ausente em `src/routes` e `routeTree.gen.ts`; `PLANO_ATIVO.json` ainda no PROMPT 42; PLAN/GATE/BUILD do 43 não integrados; extração do worker limitada a marcadores sem prova de formatos representativos. Registro formal em `docs/frontend/auditorias/V1_22_HML_SMOKE_2026-11-04.md`.

**Decisão factual:** teste SQL HML `41939010108` = **PASS limitado**; PROMPT 43/V1-22 = **PENDENTE / NÃO CERTIFICADO**, V1 = **NÃO CERTIFICADA**. Não liberar V2. Próxima ação: PLAN/GATE/BUILD 43 com prova real; depois 75/V1-23 e certificação V1. RLS HML A/B facultativo após regular 99, não bloqueante isoladamente. PROD intocada.

---

## CHECKPOINT HML — V1-22: CONEXÃO CORRIGIDA, SMOKE SQL PASS; CERTIFICAÇÃO FUNCIONAL PENDENTE (04/11/2026, 21h08 Brasília)

- **Resultado comprovado:** [workflow V1-22 HML #9, run 41939010108](https://github.com/contaos999999/contaos-hml-control/actions/runs/41939010108), job `homologacao` ID `126954685454`, `completed/success` no SHA `f7213bcec06deb0392ee9a4f56408b79d28c0326`. Preflight de URI PASS; conexão e autenticação Supabase HML por `SELECT 1` PASS; script SQL `tests/hml/v1-22-historico-smoke.sql` PASS: três funções existentes, cron `contaos-worker-historico-v1-22` ativo, `BEGIN`/`ROLLBACK`. Nenhum dado de teste persistido pelo script.
- **Evidência institucional em GitHub:** `docs/frontend/auditorias/V1_22_HML_SMOKE_2026-11-04.md`. O run NÃO publicou artifact; logs permanecem vinculados ao Actions e sujeitos a retenção.
- **Limite técnico:** smoke de presença de RPCs e cron **NÃO é execução real de upload, fila, worker, OCR/IA, segurança multiusuário ou E2E autenticado**. **V1-22 NÃO CERTIFICADO; V1 NÃO CERTIFICADA.** Ensaio RLS HML A/B segue facultativo após prompt 99 e não bloqueante isoladamente, conforme P0, sem dispensar os demais requisitos.
- **Última etapa funcional comprovadamente integrada:** 42/V1-21, PR #62; PR #68 apenas corrigiu a validação de conexão do workflow. **Próxima tarefa:** continuar o PLAN/GATE do regular **43/V1-22** antes de BUILD frontend; depois regular **75/V1-23** e certificação V1 com provas retrospectivas 00–42. **Proibido iniciar V2 ou alterar PROD** sem a certificação/aprovação exigida.

---

## CHECKPOINT P0 — NOVA REGRA CANÔNICA DE PRIORIDADE ZERO POR VERSÃO (04/11/2026)

**Decisão expressa do titular:** desenvolver **por VERSÃO, e não pela ordem dos números dos prompts**, mantendo obrigatórios **100/100 regulares 00–99** e **97/97 atômicos 000–096**, com certificação a cada etapa V1→V2→V3→V4→V5 e certificação GLOBAL/GO-NO-GO só ao final. P0 não autoriza redução de RLS, BRAND, segurança, TypeScript, GOV-020, 25 fontes, Zero-Drift, CI, Teste C, RNF nem aprovação humana exigida.

**Norma obrigatória frontend:** `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md` e matriz `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`, citadas em `AGENTS.md` e `TEMPLATE_PROMPT_PLAN_GATE.md`. **Guard CI:** `scripts/p0-version-order-gate.mjs` com 14 testes positivos/negativos, incluído no workflow. Integrado no [PR #64](https://github.com/contaos999999/contaos-hml-control/pull/64), merge `8683873c99c974d67ec49c91e3cbee7dfd392f4e`, run [#41924923763](https://github.com/contaos999999/contaos-hml-control/actions/runs/41924923763), **dois jobs SUCCESS**.

**Norma obrigatória backend/repositório de origem:** `contaos999999/develop/docs/prompts/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md`; `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `LOVABLE.md`, `.github/copilot-instructions.md` exigem leitura. `scripts/ai-context-gate.mjs` bloqueia omissão/desaparecimento da regra. [PR normativo #38](https://github.com/contaos999999/develop/pull/38) **MERGED**, `develop/main@c2bf86d011da6bfd3abaa70de38e7a722ae629de`, CI #41925882263 guard SUCCESS.

**Sincronização canônica:** snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` e `PLANO_ATIVO.json` apontam para o novo HEAD normativo `c2bf86d011da6bfd3abaa70de38e7a722ae629de`. Foi comprovado **25/25 blobs canônicos idênticos e catálogo `PROMPT_TRACKS_4_1.json` no mesmo blob original**. Nesta branch de checkpoint/reancoragem `governance/p0-sync-normative-head-20261104`, integração/CI **ainda precisam ser confirmados**, não antecipar conclusão.

**Estado funcional do frontend:** último BUILD integrado PROMPT **42/V1-21**, PR #62 MERGED `479f3be73d8caa0bd3651045ffb26f06f2b230e9`, checkpoint PR #63 `bd3b0631837f404e569d94b4a80deeba306877a9`. **V1 NÃO CERTIFICADA**. Próximos regulares obrigatórios **43/V1-22**, depois **75/V1-23**, com auditoria retrospectiva individual 00–42 e CERTIFICAÇÃO V1 com evidência. **É PROIBIDO iniciar regular 44/V2-01 enquanto certificado V1 não estiver integrado ao GitHub.** Depois V2: 44–49/76–77; V3: 50–55/78–79; V4: 56–59/80–83; V5: 60–66/84–89; TRANSVERSAIS: 67–74 e 90–99, com 100/97 rastreáveis.

**RLS HML A/B operacional:** continua NÃO VERIFICADO, FACULTATIVO APÓS regular 99 e NÃO BLOQUEANTE ISOLADAMENTE para desenvolvimento por decisão expressa anterior; não confundir com prova de segurança PROD. **PROD proibido sem processo próprio, GO final e autorização expressa.**

**Próxima ação exata:** confirmar CI e merge da reancoragem P0, conferir HEADs novamente, seguir PLAN/GATE de **43/V1-22** e depois **75/V1-23**, sem iniciar qualquer V2 antes de certificar V1. Ler sempre os documentos P0 e checkpoint antes de agir.

---

## CHECKPOINT OFICIAL — PROMPT REGULAR 42 / V1-21 INTEGRADO E VALIDADO (04/11/2026)

**HEAD principal verificado:** `contaos999999/contaos-hml-control/main@479f3be73d8caa0bd3651045ffb26f06f2b230e9`, integração [PR #62](https://github.com/contaos999999/contaos-hml-control/pull/62). **Fonte normativa:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`, confirmar HEAD vivo em cada retomada.

- **ÚLTIMA ETAPA FUNCIONAL COMPROVADAMENTE CONCLUÍDA:** PROMPT **42/V1-21 — Histórico do contrato**, rota `/contratos/:id/historico`, PR #62 **MERGED**, merge SHA `479f3be73d8caa0bd3651045ffb26f06f2b230e9`. PLAN original PR #57, GATE inicial #58; correção de cláusula Zero-Drift PR #60 e GATE revalidado PR #61, ambos integrados e com dois checks SUCCESS. BUILD anterior PR #59 **CLOSED SEM MERGE**; não repetir suas etapas nem mesclá-lo.
- **GOV-020 intacto:** árvore oficial `src/routeTree.gen.ts` blob `9ec02101dcdc238bdcc98ddc70cd2c32805e8257`, idêntica à saída do TanStack do run anterior, validada no CI. Não editar manualmente.
- **TDD:** RED real no commit `d5f65e958bdd4d9614c5d991a7c558bb760ded7e`, run [#41917210513](https://github.com/contaos999999/contaos-hml-control/actions/runs/41917210513), Vitest FAIL por adapter ausente; 848 testes legados PASS. GREEN no commit `eb7769879e9520e6f48d3b1bca41eec4ec9090ca`; ajustes TS4111 sem relaxar TypeScript.
- **CI DEFINITIVO ANTES DO MERGE:** [run #41919008227](https://github.com/contaos999999/contaos-hml-control/actions/runs/41919008227) no HEAD final `6885269c90bbdd4bc31e7bbdb7457b6ee16d1b24`: **dois jobs obrigatórios SUCCESS**, regressão **856 testes Vitest / 32 arquivos PASS**, TypeScript PASS, build PASS, BRAND-01, 25/25 fontes, 100/97 catálogo, `types.ts` imutável e GOV-020 PASS. **Teste C independente:** 216 combinações em 27 superfícies × 4 resoluções × 2 temas, 178 capturas, classificação `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA` e integridade final PASS.
- **Artefato Teste C final:** `contaos-teste-c-41919008227-1`, ID `13366721494`, digest SHA-256 `00317962ffa567c868ea4905f200239b2b8d1117826cf1105b80176c13ca8e32`. Evidência Actions sujeita à retenção, arquivamento institucional externo adicional NÃO COMPROVADO. Dossiê `docs/frontend/auditorias/PROMPT_42_V121_TESTES_2026-11-04.md`.
- **Segurança e âmbito:** somente frontend HML, consultas read-only do histórico do contrato corrente, dados existentes sob RLS; nenhum backend/RLS/PROD, migrations, `types.ts`, assets BRAND, CSS global ou pacote alterado. Teste operacional de isolamento RLS HML A/B **NÃO VERIFICADO, FACULTATIVO DEPOIS DO REGULAR 99, NÃO BLOQUEANTE ISOLADAMENTE**, conforme decisão do titular no PR #49. Não declarar E2E HML autenticado nem WCAG privado integral.
- **Próxima tarefa exata:** regular **43/V1-22 — Ingestão de histórico**. Recuperar texto original do PROMPT 43 da fonte autenticada SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, mapear 97 atômicos, conferir backend/Storage/RPC efetivamente existentes antes de habilitar escrita, fazer PLAN com allowlist/CI, GATE em PR próprio e só então TDD/BUILD/Teste C. `PLANO_ATIVO.json` segue PROMPT 42 VALIDADO até GATE 43. **Não repetir PROMPT 41 nem 42**.

---

## CHECKPOINT PRIORITÁRIO — BUILD PROMPT 42 / V1-21 CI VERDE, MERGE A CONFIRMAR (04/11/2026)

- **Fonte:** frontend main de partida `a971ec2ba8736977b54e8c71786da4ad8f79c9c0`; backend normativo `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Reconsultar HEADs na próxima retomada. Última etapa funcional integrada comprovada **41/V1-20 PR #52**; **42/V1-21 implementado, somente em PR #62 até confirmação explícita de merge**.
- PLAN 42 PR #57 integrado; GATE #58 integrado. O primeiro BUILD #59 falhou legitimamente `FRONTEND SCOPE FAIL` por ausência da cláusula literal `ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)`. Correção de PLAN PR #60 integrada, CI #41916280531 2 SUCCESS; GATE revalidado PR #61 integrado em `a971ec2ba8736977b54e8c71786da4ad8f79c9c0` CI #41916776592 2 SUCCESS. Não mesclar PR #59, não reescrever histórico.
- BUILD definitivo [PR #62](https://github.com/contaos999999/contaos-hml-control/pull/62), branch `build/prompt-42-v121-historico-validated-20261104`. TDD RED real commit `d5f65e958bdd4d9614c5d991a7c558bb760ded7e`, [run #41917210513](https://github.com/contaos999999/contaos-hml-control/actions/runs/41917210513), Vitest FAIL pela ausência do adaptador, 848 testes anteriores PASS. BUILD `8625730a054fa130440ae2c9a3a8b2acba4f2b16` acrescentou tela/rota/queries/testes sob allowlist. `src/routeTree.gen.ts` **blob igual ao gerador oficial** `9ec02101dcdc238bdcc98ddc70cd2c32805e8257`; sem edição manual.
- GREEN validado no commit `eb7769879e9520e6f48d3b1bca41eec4ec9090ca`: [CI #41918054745](https://github.com/contaos999999/contaos-hml-control/actions/runs/41918054745) **dois jobs SUCCESS no mesmo SHA**. Vitest **32 arquivos/856 testes PASS**; TypeScript/build/GOV-020/BRAND-01/tipos oficiais 25/25 fontes e 100/97 PASS. Teste C independente **216 combinações e 178 capturas**, `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA`, integridade somente leitura PASS.
- **Artefato evidência Teste C:** `contaos-teste-c-41918054745-1`, ID `13365099685`, SHA-256 `1047d08a6f554b1a6972dcc63452057c265a89df520d06996cc2e5228253f7c7`; retenção GitHub Actions limitada, arquivamento externo permanente não comprovado. Dossiê `docs/frontend/auditorias/PROMPT_42_V121_TESTES_2026-11-04.md` na mesma branch.
- **Escopo V1-21:** `/contratos/:id/historico`, leitura de relatórios, apontamentos, respostas/desfechos, precedentes e regras apenas do contrato/organização corrente, paginação de 25 e estados PT-BR. Sem backend, RLS, PROD, `types.ts`, assets BRAND, CSS global ou dependências novas.
- **RLS HML A/B:** NÃO VERIFICADO, FACULTATIVO APÓS PROMPT REGULAR 99, NÃO BLOQUEANTE ISOLADAMENTE por decisão do titular PR #49. Não declarar acesso autenticado HML, WCAG integral ou prova de isolação RLS efetiva.
- **Próxima ação exata:** exigir dois jobs SUCCESS no HEAD final incluindo o dossiê e checkpoint, então integrar PR #62 via ruleset e verificar merge SHA/main. Se integrado, última etapa funcional passa a **PROMPT 42/V1-21**; próximo PLAN **43/V1-22 Ingestão de histórico**, usando texto original autenticado e matriz de 97 atômicos. Não antecipar BUILD 43 sem PLAN/GATE, nem repetir 42.

---

## CHECKPOINT PRIORITÁRIO — REVALIDAÇÃO DO GATE 42 APÓS CORREÇÃO DOCUMENTAL (04/11/2026)

- CI do primeiro BUILD #59 encontrou `FRONTEND SCOPE FAIL: PLAN sem cláusula ZERO-DRIFT literal`, sem chegar a regressão; Teste C detectou corretamente routeTree não gerado. Não alterar nem flexibilizar guard.
- PLAN original #57 integrado, GATE original #58 integrado. Correção literal de PLAN #60 **integrada** na `main@7721577cf4c43fe94f8f923e085a08c016fa746e`, run [41916280531](https://github.com/contaos999999/contaos-hml-control/actions/runs/41916280531) **dois checks SUCCESS**. Frase canônica agora inclui `(OBRIGATÓRIO)`.
- GATE revalidado na branch `gate/revalidate-prompt42-plan-literal-20261104`, `PLANO_ATIVO.json` continua 42/VALIDADO e aponta para CI corrigido #41916280531; **BUILD antigo #59 não é apto**, pois o primeiro commit de `src/**` antecede esse PLAN. Não usar rebase/force push e não integrar #59.
- Próxima ação: CI e merge deste GATE corrigido; criar branch de BUILD **nova** a partir do merge do GATE; portar pelo GitHub somente os arquivos de aplicativo permitidos do #59 e a saída **exata** do gerador TanStack, comprovada no job Teste C da execução antiga (#41916018778, esperado blob `9ec0210`). Executar qualidade, TDD, Teste C 216 casos com dois SUCCESS no SHA final. Não repetir PROMPT 41.
- RLS HML A/B operacional: **NÃO VERIFICADO, FACULTATIVO DEPOIS DO REGULAR 99, NÃO BLOQUEANTE ISOLADAMENTE**; todo o resto continua obrigatório.

---

## CHECKPOINT PRIORITÁRIO — PROMPT 42/V1-21 GATE EM PR (04/11/2026)

- PLAN PROMPT 42 / V1-21 histórico do contrato **integrado** pelo [PR #57](https://github.com/contaos999999/contaos-hml-control/pull/57), merge `8f0a4ebba23f0a1047d831559633c54b9439e6de`; CI documental [#41913182521](https://github.com/contaos999999/contaos-hml-control/actions/runs/41913182521), dois checks SUCCESS. Frontend main basal `8f0a4ebba23f0a1047d831559633c54b9439e6de`; fonte normativa `develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`.
- PR de GATE em preparação na branch `gate/prompt-42-v121-historico-20261104`: `docs/frontend/planos/PLANO_ATIVO.json` atualizado para prompt 42 VALIDADO, com allowlist de dez caminhos de BUILD e classificação individual dos 97 atômicos, documentação `docs/frontend/planos/PROMPT_42_V1_21_HISTORICO_CONTRATO_2026-11-04.md`, fonte literal original autenticada por hash. **Não iniciar src/** até CI e merge deste GATE.
- Último BUILD funcional integrado: PROMPT 41/V1-20 PR #52, merge `a114e2c9d47cb359a79bda05f5ee95699e4ecd37`, 848 testes PASS e Teste C 208 combinações/24 capturas. Não repetir.
- Próximo BUILD após GATE: V1-21 `/contratos/:id/historico`, somente leitura de relatórios históricos, apontamentos, respostas, desfechos, precedentes e regras do contrato atual, com paginação e isolamento lógico; ingestão V1-22/PROMPT 43 fora do escopo. A saída `src/routeTree.gen.ts` deve ser gerada pelo TanStack, não editada manualmente (GOV-020).
- Ensaio RLS HML A/B **NÃO VERIFICADO, FACULTATIVO DEPOIS DO REGULAR 99, NÃO BLOQUEANTE ISOLADAMENTE**, sem dispensar autenticação, escopo, logs, TDD, CI/BRAND-01 e Teste C independente. Backend, PROD e `types.ts` certificados não podem ser alterados.

---

## CHECKPOINT — PROMPT 42 / V1-21 PLAN EM VALIDAÇÃO (04/11/2026)

- **Frontend de origem:** `contaos999999/contaos-hml-control/main@e12bf962d83b347f1c168c3e7541172d9ae35df4`. **Fonte normativa:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Verificar HEADs em nova sessão. CI pós-merge do regular 41, run [41911981719](https://github.com/contaos999999/contaos-hml-control/actions/runs/41911981719), ambos os jobs SUCCESS.
- **Último BUILD funcional concluído:** PROMPT regular 41/V1-20, PR #52 merge `a114e2c9d47cb359a79bda05f5ee95699e4ecd37`, dossiê e checkpoint integrados PR #56 merge `e12bf962d83b347f1c168c3e7541172d9ae35df4`. **Não repetir**.
- **Próximo regular 42/V1-21:** histórico do contrato na rota canônica `/contratos/:id/historico`. Fonte literal original inspecionada nos parágrafos 2363–2422 do Manual Mestre 100 prompts, SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`. Matriz 97/97 de aplicabilidade `docs/frontend/auditorias/PROMPT_42_V121_CROSSWALK_97_ATOMICOS_2026-11-04.md`; PLAN `docs/frontend/planos/PROMPT_42_V1_21_HISTORICO_CONTRATO_2026-11-04.md`.
- **Escopo previsto:** consulta somente leitura aos relatórios anteriores, apontamentos, respostas/desfechos, precedentes e regras preventivas associados ao **contrato e organização corrente**, com paginação e estados de processamento oficiais. Ingestão/IA/OCR V1-22 fica para PROMPT 43, sem backend novo. Tipos Supabase `src/integrations/supabase/types.ts` blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, nenhuma alteração permitida.
- **Princípios obrigatórios:** BRAND-01, RNFs, escopo e contrato, prevenção IDOR no frontend, TanStack `routeTree.gen.ts` gerado automaticamente/GOV-020, TDD RED/GREEN e Teste C previsto 27×4×2 = 216 (sem alegar E2E privado). Nenhuma alteração em backend ou PROD. RLS HML A/B real permanece **NÃO VERIFICADO, FACULTATIVO APÓS PROMPT 99 e NÃO BLOQUEANTE ISOLADAMENTE**.
- **Estado:** apenas PLAN e matriz documental na branch `plan/prompt-42-v121-historico-contrato-20261104`; **NÃO CONSIDERAR BUILD 42 AUTORIZADO** até CI do PLAN, parecer de validação e GATE `PLANO_ATIVO.json` em PR próprio. Próxima ação: concluir PR documental do PLAN, dois checks verdes, revisão técnica e PR de GATE; após integração do GATE, TDD/BUILD V1-21.

---

## CHECKPOINT PRIORITÁRIO — PROMPT REGULAR 41 / V1-20 BUILD INTEGRADO (04/11/2026)

**HEAD comprovado da `main` após o BUILD:** `contaos999999/contaos-hml-control/main@a114e2c9d47cb359a79bda05f5ee95699e4ecd37`. **Normativo:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Estes HEADs são fotografias de evidência: **verificar HEAD vivo na próxima execução**. O checkpoint desta seção está na branch `docs/checkpoint-prompt41-v120-integrado-20261104` aguardando seu próprio PR/CI até integração comprovada.

- **ÚLTIMA ETAPA FUNCIONAL COMPROVADAMENTE CONCLUÍDA:** **PROMPT regular 41 / V1-20 — Apresentação e protocolo**, rota `/competencias/:id/apresentacoes/:apresentacaoId`. PLAN PR #50, GATE PR #51, BUILD [PR #52](https://github.com/contaos999999/contaos-hml-control/pull/52) **MERGED** na main@ `a114e2c9d47cb359a79bda05f5ee95699e4ecd37`. Não repetir PROMPT 40/V1-19 nem PROMPT 41/V1-20.
- **Desvio routeTree solucionado:** blob TanStack real `src/routeTree.gen.ts@0dcfb92ffddaf9c1f7dd441ef0b45ac9113ff3f7`, commit `8c409693b8dd129c954746c79a6a19719eccc1cb`. Branch reconciliada com main e GOV-020 por merge de dois pais `9efd645d4dc2867484a4e4963d8a107cef7f1b7b`, sem rebase/force push; preservado checkpoint vigente na main.
- **CI BUILD FINAL** [run #41910821199](https://github.com/contaos999999/contaos-hml-control/actions/runs/41910821199) no SHA `9efd645d4dc2867484a4e4963d8a107cef7f1b7b`: dois checks exigidos **SUCCESS**. Job Zero-Drift ID `126857585652`: fonte 25/25 e 100/97 PASS, GOV-020 PASS, **Vitest 31 arquivos / 848 testes PASS**, TypeScript PASS, build PASS, BRAND-01 e blob types.ts PASS. Job Teste C independente ID `126857585844`: GOV-020 PASS, Playwright **208 combinações / 24 capturas**, resultado `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA`, integridade final **PASS**.
- **Artefato Teste C** `contaos-teste-c-41910821199-1`, ID `13362587330`, SHA-256 `947a79f926c28f3e805ead20a9ac4bd1af0d70a4458807ce1e5708ea0cb9a6de`. Retenção limitada GitHub Actions; arquivamento externo institucional permanente não demonstrado.
- **Segurança e escopo:** somente frontend aprovado, pacote de apresentação congelado e SELECT de dados oficiais; backend, types.ts certificado, RLS, PROD e marca não modificados. O ensaio RLS real entre organizações em HML segue **NÃO VERIFICADO, FACULTATIVO APÓS REGULAR 99, NÃO BLOQUEANTE** por decisão expressa PR #49. Não afirmar E2E autenticado ou conformidade WCAG integral.
- **Proteção futura:** GOV-020 PR #54 integrado e verificado; o build não aceita diferença de routeTree gerado, e Teste C repete o gate sem bypass. Manter os dois checks.
- **PRÓXIMA TAREFA:** regular **42 / V1-21**, iniciar pelo texto original autenticado e triagem dos 97 atômicos, elaborar PLAN, validação técnica e GATE em PRs separados, executar TDD RED/GREEN, CI/Teste C e evidências. **Não iniciar BUILD 42 sem GATE PASS**. O `PLANO_ATIVO.json` ainda está 41 VALIDADO até avanço formal; não promover automaticamente. Atualizar este checkpoint e registrar resultado de integração após cada módulo.

---

## CHECKPOINT OFICIAL — GOV-020 PREVENÇÃO DE DRIFT DE ROTAS INTEGRADA (04/11/2026)

**HEAD comprovado da main após integração:** `contaos999999/contaos-hml-control/main@7149420e980fc87c4fc4477044fb9699e4e23a43` (PR #54 MERGED). Fonte normativa `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6` verificada no CI. **Conferir HEADs atuais novamente antes de retomar.**

- **GOV-020 IMPLEMENTADO E INTEGRADO** via [PR #54](https://github.com/contaos999999/contaos-hml-control/pull/54), head `de5e69cfe1b669ed8ceb957ae920925d2a63f88f`, merge `7149420e980fc87c4fc4477044fb9699e4e23a43`; [CI run #41908955342](https://github.com/contaos999999/contaos-hml-control/actions/runs/41908955342): **ContaOS Frontend Zero-Drift SUCCESS e Teste C Independente SUCCESS no mesmo SHA**. Vitest **841 PASS, 30 arquivos**, 4 autotestes GOV-020 PASS; fonte canônica 25/25, TypeScript, Vite build, BRAND-01, blob `types.ts` e checks existentes preservados. Teste C artefato `contaos-teste-c-41908955342-1` ID `13361398084`, SHA256 `90483de5fd1c5589d670d38a14a22774b72a2e0796107b40fe4a9889e56ef95f`.
- **Controle 1, preventivo:** `scripts/route-tree-drift-gate.mjs` compara `src/routeTree.gen.ts` ao Git após geração `bunx vite build` no workflow quality, **antes** dos testes longos. FAIL com diff se nome/ordem divergir, arquivo ausente ou não versionado. Nunca altera, restaura ou comita arquivos no CI.
- **Controle 2, independente:** workflow Teste C executa mesmo guard após Vite dev inicializado e antes do Playwright; preserva sem alterações `git diff --exit-code --` e `git status --porcelain --untracked-files=no` ao final. Dois checks obrigatórios permanecem, sem bypass.
- **Autotestes negativos:** 4 casos PASS, incluindo ambiente limpo (PASS esperado), arquivo divergente (FAIL esperado), arquivo removido (FAIL esperado) e arquivo não versionado (FAIL esperado). Execução no CI real com snapshots TanStack reproduzíveis, sem novas dependências.
- **Regra permanente:** `AGENTS.md`, `docs/frontend/planos/TEMPLATE_PROMPT_PLAN_GATE.md`, `docs/frontend/governanca/GOV_020_GERACAO_DETERMINISTICA_ROTAS_2026-11-04.md`. Quando um prompt 42–99 adicionar/renomear/excluir rota, criar em `src/routes/`, gerar oficialmente e versionar `src/routeTree.gen.ts` na allowlist do PLAN aprovado, antes do PR; nunca editar à mão. Não foi alterado `package.json` ou `bun.lock`, nem backend/PROD/brand/RLS/types.
- **PR #52 BUILD 41/V1-20:** permanece **ABERTO e NÃO INTEGRADO**; sua árvore TanStack, anterior a GOV-020, ainda diverge da gerada. O CI da etapa [#41904426343](https://github.com/contaos999999/contaos-hml-control/actions/runs/41904426343) comprovou 848 Vitest PASS, TypeScript e build PASS, Teste C navegador 208 combinações/24 capturas, mas job final **FAIL** por diferença `src/routeTree.gen.ts`. GOV-020 detectará drift antecipadamente em novos runs, mas **não corrige esse arquivo automaticamente**. A correção por conector GitHub foi bloqueada anteriormente; NÃO DECLARAR CORRIGIDO ou fazer merge com checks vermelhos.
- **Última etapa funcional concluída:** PROMPT 40/V1-19 PR #44. PLAN/GATE 41 integrados #50/#51; BUILD #52 pendente de sincronização legítima do gerador e dois checks SUCCESS. Próxima tarefa exata: aplicar saída oficial TanStack em `src/routeTree.gen.ts` na branch #52 usando ambiente com permissão de escrita, repetir CI e Teste C no HEAD final, integrar sem bypass e prosseguir regular 42.
- **RLS HML A/B real:** NÃO VERIFICADO, facultativo após PROMPT regular 99, não bloqueante isoladamente conforme decisão no PR #49; outros gates de segurança intactos.

---

## CHECKPOINT — GOV-020 GERAÇÃO DETERMINÍSTICA ROUTETREE / CI PREVENTIVO (04/11/2026)

**Origem deste workstream:** frontend `main@cffbf0532a7fe76f384130ae56df080a7a8a14ed`; normativo `develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Confirmar HEAD vivo antes de retomar. **Último BUILD funcional integrado:** regular 40/V1-19, PR #44. PLAN/GATE 41 integrados PRs #50/#51; BUILD V1-20 PR #52 **ABERTO**, não repetir e não declarar concluído antes de 2 checks SUCCESS.

**Motivo GOV-020:** PR #52 teve 848 testes PASS, TypeScript/build PASS e Teste C 208 combinações/24 capturas, porém check obrigatório Teste C FAIL no passo final porque o TanStack reescreveu `src/routeTree.gen.ts` (nome interno/ordem diferentes). Run [41904426343](https://github.com/contaos999999/contaos-hml-control/actions/runs/41904426343), artefato Teste C ID `13358194058`, SHA-256 `6d218dd9e482871d2d26c9427a8e51483bb38dbcf93a9b2b248df69fd4183279`. Correção imediata de `routeTree.gen.ts` no PR #52 ainda NÃO COMPROVADA; não fazer bypass nem merge.

**Proteção preventiva em branch** `governance/gov-020-route-tree-drift-prevention-20261104`:
- `scripts/route-tree-drift-gate.mjs` compara arquivo gerado/versionado em Git, somente leitura, FAIL em diferenças com diff.
- `scripts/route-tree-drift-gate.test.mjs`: cenários PASS limpo, FAIL alterado, FAIL removido, FAIL não versionado, com diretórios temporários.
- `.github/workflows/contaos-frontend-zero-drift.yml`: executa testes GOV-020, move `vite build` (gerador já existente) para antes da regressão longa e verifica drift sem alterar fontes; mantém Vitest/TS/brand e dois checks.
- `.github/workflows/contaos-teste-c-independente.yml`: verifica árvore após Vite dev, antes de Playwright; preserva check final de integridade.
- `AGENTS.md` e `docs/frontend/planos/TEMPLATE_PROMPT_PLAN_GATE.md` tornam a regra permanente para prompts futuros de rota.
- Documento normativo frontend `docs/frontend/governanca/GOV_020_GERACAO_DETERMINISTICA_ROTAS_2026-11-04.md`. Sem mudanças no backend, `types.ts`, pacote/lock, BRAND ou PROD.

**Estado desta branch:** implementação submetida a CI próprio, não declarar PASS nem merge antes dos dois checks no HEAD definitivo. **Próxima ação:** abrir PR GOV-020, corrigir erros reais de CI sem enfraquecer gates, integrar via ruleset; depois retomar PR #52 e sincronizar árvore por gerador em ambiente com escrita legítima, exigindo dois checks SUCCESS antes de avançar ao prompt 42. Prova RLS A/B HML continua não verificada, facultativa pós-prompt 99 conforme PR #49, sem influência sobre GOV-020.

---

## CHECKPOINT PRIORITÁRIO — BUILD PROMPT 41/V1-20 EM PR #52, SEM MERGE (04/11/2026)

**HEAD principal auditado:** `contaos999999/contaos-hml-control/main@f8adb8af51fe49a9bd03ce4fa92238f8f19e6a33`, GATE PR #51 validado e integrado; **fonte normativa** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Reconsultar HEADs, branches e checks antes de agir. **Último módulo funcional comprovadamente integrado é PROMPT 40 / V1-19**. Não avançar para regular 42 antes de integrar BUILD 41.

- **PLAN/GATE 41:** PR #50 (PLAN e allowlist), CI [41901870132](https://github.com/contaos999999/contaos-hml-control/actions/runs/41901870132) com dois checks SUCCESS, merge `69182d1317cac3fa6a6fb88cd8423f834d89ce96`; PR #51 (GATE, `PLANO_ATIVO.json`=41 VALIDADO), CI [41902412103](https://github.com/contaos999999/contaos-hml-control/actions/runs/41902412103) com dois checks SUCCESS, merge `f8adb8af51fe49a9bd03ce4fa92238f8f19e6a33`.
- **PR BUILD ativo:** [#52](https://github.com/contaos999999/contaos-hml-control/pull/52), branch `build/prompt-41-v120-apresentacao-protocolo-20261104`, HEAD registrado `8c6030afb98228d1d1f4172ecd3bc252b3f38b70`, **ABERTO / NÃO INTEGRADO**. Os fontes funcionais V1-20 foram acrescentados somente na allowlist, sem modificar Supabase, repositório backend, PROD, `src/integrations/supabase/types.ts` (blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`) ou ativos BRAND.
- **TDD RED:** commit inicial dos testes `655eec1f3ea4557510470d4dfe98ae57ae99a25b` apresentou FAIL em regressão antes do adaptador, workflow [41903028818](https://github.com/contaos999999/contaos-hml-control/actions/runs/41903028818) posteriormente cancelado por novos commits; não converter resultado em PASS. Ajustes Prettier `46982853...` e TypeScript fixtures `ef8c402e...`.
- **GREEN funcional demonstrado, mas não integral:** no commit `ef8c402ee10fc861a48831570644e080cb95a1f1`, run [41904426343](https://github.com/contaos999999/contaos-hml-control/actions/runs/41904426343), job **ContaOS Frontend Zero-Drift SUCCESS**, Vitest **31 arquivos/848 testes PASS**, TypeScript PASS, build de produção PASS e validação da fonte canônica PASS.
- **Teste C executado com ressalva:** no mesmo run, Playwright executou **208 combinações / 24 capturas**, resultado de navegador `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA`. Artefato `contaos-teste-c-41904426343-1`, ID `13358194058`, SHA-256 `6d218dd9e482871d2d26c9427a8e51483bb38dbcf93a9b2b248df69fd4183279` (retenção GitHub Actions com expiração em 02/02/2027). **Job obrigatório Teste C FAIL** no passo final de integridade porque TanStack regenerou `src/routeTree.gen.ts` e detectou alterações contra o arquivo versionado. **NÃO MESCLAR enquanto FAIL**.
- **Correção exata a executar:** recuperar diff do job GitHub Actions `126835462485` no run 41904426343. O gerador usa `CompetenciasIdApresentacoesApresentacaoIdRoute` em vez de `CompetenciasIdApresentacoesIdApresentacaoIdRoute` e posiciona a rota V1-20 no bloco após `ContratosIdRegrasRoute`, antes de `ContratosIdCompetenciasNovaRoute`, consistentemente em imports, const, unions, interfaces, mapas e filhos da árvore. Blob versão antiga `616fe1019dc03e5a70a4e44582f79a281bd69d26`; blob gerado indicado pelo CI começa por `0dcfb92`. **Aplicar a saída exata do gerador**, não editar o mecanismo de verificação nem desabilitar `git status --porcelain --untracked-files=no`.
- **Impedimento de ferramenta:** chamadas conectadas GitHub para atualizar especificamente o conteúdo extenso de `src/routeTree.gen.ts`, inclusive atualização mínima do nome interno e tentativa de criar blob, foram recusadas com erro de configuração de segurança da ferramenta. **Nenhuma correção do routeTree foi confirmada nem pode ser declarada concluída**. Não contornar controles. A operação permanece como próxima tarefa concreta para uma ferramenta de edição legitimamente habilitada.
- **Evidências registradas na branch BUILD:** `docs/frontend/auditorias/PROMPT_41_V120_TESTES_2026-11-04.md` e nova seção do checkpoint naquela branch, com commit `8c6030afb98228d1d1f4172ecd3bc252b3f38b70`; comentário de auditoria no PR #52. Esta seção na main é o checkpoint **institucional de trabalho ainda aberto**, não merge do BUILD.
- **Decisão do titular PR #49:** ensaio de RLS real no Supabase HML com usuários A/B de organizações diferentes **NÃO VERIFICADO, FACULTATIVO APÓS PROMPT REGULAR 99 E NÃO BLOQUEANTE ISOLADAMENTE** para frontend 41–99; demais controles de segurança, TDD, CI, BRAND-01 e Teste C permanecem obrigatórios. HML privado autenticado e WCAG integral NÃO VERIFICADOS.
- **Próxima sequência:** corrigir exclusivamente a árvore gerada na branch #52 por método autorizado, confirmar blob e executar CI no SHA final com **dois jobs SUCCESS**, verificar Teste C 208 e crivo BRAND; registrar resultados e merge com ruleset sem bypass; somente então iniciar PLAN regular 42. Não refazer V1-19 nem repetir 39 etapas históricas.

---

## CHECKPOINT PRIORITÁRIO — PROMPT 41 GATE ATIVADO EM PR, 04/11/2026

O PR #50 PLAN V1-20 teve HEAD `5bc4162b88b60a970a7138c60783f7719718a363`, dois checks SUCCESS no run 41901870132 e merge na main `69182d1317cac3fa6a6fb88cd8423f834d89ce96`. A validação técnica e allowlist de 10 caminhos constam em `docs/frontend/planos/PROMPT_41_V1_20_VALIDACAO_TECNICA_2026-11-04.md`. O ramo `gate/prompt-41-v120-validado-20261104` atualizou `PLANO_ATIVO.json` para PROMPT 41, com gates planejados PASS, fontes originais e crosswalk comprovados, **condicionado a CI do PR de GATE e integração normal à main**. Não editar `src/**` antes desse merge. A prova real RLS HML A/B permanece NÃO VERIFICADA e facultativa após regular 99, sem ser impedimento isolado de BUILD; demais segurança e Teste C continuam obrigatórios. Backend, PROD, types.ts e BRAND não foram alterados. Último BUILD funcional integrado continua V1-19 PR #44. Próxima tarefa: CI e merge do GATE, branch BUILD 41, TDD/regressão/Teste C independente, evidências e novo checkpoint com HEAD real.

---

## CHECKPOINT PRIORITÁRIO — DECISÃO TITULAR: HML A/B PÓS-PROMPT 99, FACULTATIVO (04/11/2026)

**Baseline confirmado antes deste registro:** frontend `contaos999999/contaos-hml-control/main@a70591bf89189bdf87c474061e2b91717533adab` (PR #48 integrado), normativo `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; verificar HEADs novamente em cada retomada. Último módulo funcional integrado: **PROMPT 40/V1-19**; próxima atividade: **PROMPT 41/V1-20**.

- **DECISÃO EXPRESSA:** o teste operacional de RLS real no Supabase HML com usuários de organizações A/B, comprovando impedimento de acesso cruzado, fica **FACULTATIVO, NÃO BLOQUEANTE, PARA DEPOIS DA EXECUÇÃO DO PROMPT REGULAR 99**. Não será pré-condição de GATE/BUILD/frontend entre prompts 41–99. Regra registrada em `docs/frontend/governanca/DECISAO_RLS_HML_AB_POS_PROMPT_99_2026-11-04.md` e suplemento ADR-DEV-002.
- **Não confundir prova com dispensa de segurança:** isolamento de tenant, autoridade de RLS, contratos tipados certificados, auth, validação por frontend, nenhum secret, proibição de IDOR e fallback de privilégios, TDD, CI, Teste C, 97 atômicos e BRAND-01 **continuam gates obrigatórios**. Teste operacional HML A/B permanece **NÃO VERIFICADO**; um FAIL real de segurança impede merge. Não afirmar HML/PROD certificado. Nenhuma intervenção no Supabase está autorizada por esta decisão.
- **PROMPT 41:** PLAN e fontes originais integrados PRs #46–#48; fonte original literal certificada; matriz de triagem 97 IDs; tipos `apresentacoes_contratante`, `pacotes_competencia`, `itens_pacote_competencia` confirmados no `types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. O teste externo A/B **não bloqueia mais** o PLAN, mas validação técnica remanescente, GATE independente de `PLANO_ATIVO.json` e CI ainda são necessários; o manifesto continua PROMPT 40 até atualização específica.
- **Próxima tarefa:** integrar este registro documental por PR e dois checks verdes; avaliar gates remanescentes do PLAN 41 e, se PASS, abrir GATE separado. Sem alteração de backend, produção, Lovable BUILD nem código de aplicação nesta decisão.

---

## CHECKPOINT PRIORITÁRIO — PROMPT 41 FONTE ORIGINAL AUTENTICADA, 04/11/2026

**Frontend antes desta auditoria:** `contaos999999/contaos-hml-control/main@c8c599dede97d68b22af86b7909567ed8d5179a4` (PR #47 integrado). **Repositório normativo:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; fonte canônica permanece preservada. Conferir HEAD novo a cada retomada.

- **Fonte literal encontrada:** ZIP original do titular `ContaOS_Pacote_Mestre_Arquitetura_4_1_100_PRD_Lovable_Supabase_BRAND_v1_0_FINAL.zip`; SHA-256 ZIP `5ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da`. Manual interno `Manual_Mestre_Prompts_4_1_100_PRD.docx`, SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, **idêntico ao SHA original no catálogo**; o regular 41 ocupa os parágrafos 2303–2362. Caderno 97 original SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`, também idêntico à fonte normativa, ids 000/019/020/067/087/093 conferidos.
- **Espelho permanente do prompt literal:** `docs/frontend/fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md`, reproduzido com rastreabilidade; dossiê `docs/frontend/auditorias/PROMPT_41_V120_FONTE_LITERAL_E_CONTRATO_PACOTE_2026-11-04.md`. A falta anterior do texto literal **RESOLVIDA**; nenhuma renumeração dos 100 regulares/97 atômicos.
- **Contrato frontend de consulta:** `src/integrations/supabase/types.ts` blob imutável `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` confirma `apresentacoes_contratante`, `pacotes_competencia` e **`itens_pacote_competencia`**. Itens contêm `id_pacote`, `entidade_id/tipo`, `versao_id`, `hash`, `metadados` e tenant. Dados para o detalhe existem **estruturalmente**, mas permissões RLS e SELECT real HML A/B permanecem NÃO VERIFICADOS. Não reconstruir pacote usando documentos atuais.
- **Registro UUID:** `registrar_apresentacao` na V1-19 retorna UUID, que é o identificador de apresentação para a rota `/competencias/:id/apresentacoes/:apresentacaoId`. Não confundir com texto do protocolo externo.
- **Auditoria 97/97:** PR #47 integrado `c8c599dede97d68b22af86b7909567ed8d5179a4`, matriz `docs/frontend/auditorias/PROMPT_41_V120_CROSSWALK_97_ATOMICOS_2026-11-04.md` com 000 aplicável, 019/020/067 dependências, 087/093 condicionais e 91 sem implementação nova. Não confundir com certificação integral do PRD.
- **Último BUILD funcional:** V1-19, PR #44 concluído, CI dois checks SUCCESS, 841 testes, 200 combinações, HML real NÃO VERIFICADO.
- **GATE atual:** o PLAN 41 agora possui fonte literal e contrato tipado, porém **NÃO VALIDADO para BUILD** por ausência de evidência operacional de acesso RLS HML e snapshot efetivamente legível. `PLANO_ATIVO.json` ainda aponta para 40 VALIDADO, não alterar até gate próprio. Ações HML/backend exigem autorização humana específica prevista na ADR-DEV-002. Não alegar E2E.
- **Ramo deste checkpoint:** `audit/prompt-41-original-literal-frozen-package-20261104`, documental; exige PR e dois checks SUCCESS no HEAD final. Nenhuma modificação no Supabase/PROD, `types.ts`, frontend funcional, design visual ou Lovable BUILD.
- **Próxima tarefa:** concluir PR documental e CI, confirmar HEAD da main; quando houver autorização apropriada, executar inspeção somente leitura do contrato de SELECT e, após provas, criar GATE do PLAN 41 em PR separado. Não iniciar BUILD indevidamente.

---

## CHECKPOINT PRIORITÁRIO — V1-20 TRIAGEM DOS 97 ATÔMICOS, 04/11/2026

**HEAD frontend de origem da auditoria:** `contaos999999/contaos-hml-control/main@94bbceafa45af291c73558ea7d5aca4c132f5ae5` (PR #46 integrado; PLAN registrado, NÃO VALIDADO para BUILD). **HEAD normativo:** `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6` (sem mudanças). Não presumir que esses HEADs continuem atuais.

- **Nova auditoria documental:** `docs/frontend/auditorias/PROMPT_41_V120_CROSSWALK_97_ATOMICOS_2026-11-04.md`; 97 IDs classificados individualmente: 000 diretamente aplicável, 019/020/067 dependências transversais herdadas, 087/093 condicionais sem funcionalidade liberada, 91 sem implementação nova na tela. A triagem não afirma que 97 requisitos estejam executados/homologados. Catálogo normativo não alterado e `full_crosswalk_verified=false` permanece.
- **Regra além do BRAND-01:** exigir direitos de consulta reais, isolamento multi-organização/RLS, pacote imutável e hash oficial, rastreabilidade, auditabilidade, NFRs, PT-BR, acessibilidade e Teste C. Não implementar nenhum requisito adicional em V1-20 por associação numérica.
- **GATE atual:** PR #46 foi integrado documentalmente em `94bbceafa45af291c73558ea7d5aca4c132f5ae5`, mas `PLANO_ATIVO.json` continua regular 40 VALIDADO; V1-20 segue **NÃO VALIDADO/BLOQUEADO para BUILD**. Faltam texto literal original do PROMPT 41 e contrato de leitura detalhada do pacote (RLS real/ACL, snapshot congelado). Testes A/B HML, E2E privado e WCAG abrangente continuam NÃO VERIFICADOS. Não usar mock como prova.
- **Último BUILD funcional concluído:** PR #44 V1-19, commit de merge `2bc2696b1272cce74f6aaaae4dd608751b469f5b`, 841 testes, Teste C escopado 200 cenários; não repetir.
- **Branch de auditoria atual:** `audit/prompt-41-v120-atomic-crosswalk-20261104`. A integração depende de PR independente com dois checks verdes no HEAD final e sem bypass. Nenhuma alteração de backend HML/PROD, `types.ts`, BRAND, Lovable BUILD ou código funcional nesta etapa.
- **Próxima ação após merge documental:** recuperar fonte literal do regular PROMPT 41 e dados oficiais de leitura autorizada; preparar GATE do PLANO_ATIVO 41 somente quando cada gate aplicável estiver PASS. Investigação específica Supabase/backend requer consentimento humano adicional conforme ADR-DEV-002. Não afirmar BUILD liberado nesta auditoria.

---
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


## Retomada V1-23 / GOV-020 — 05/11/2026
- PR #84 integrado na main: gerador TanStack produziu e versionou `src/routeTree.gen.ts` no BUILD #83 (HEAD `1891e330bbd114a9edb54721df434f4efabaddfb`).
- CI do BUILD #83, execução `41952164027`: Teste C PASS; Zero-Drift FAIL exclusivamente no gate de escopo porque `src/routeTree.gen.ts` não constava na allowlist do PLAN.
- PR #85 GOV-020, execução `41954661365`: Zero-Drift PASS e Teste C PASS; integrado à main no commit `74189592db7a9bd945ce8c6311d482bde701be26`.
- GOV-020 autoriza exclusivamente a árvore gerada quando existe rota `src/routes/*.tsx` já autorizada pelo PLAN. Não libera backend nem arquivos arbitrários.
- **Pendente:** nova validação do PR #83 sobre a main atual; inspecionar Zero-Drift e Teste C no novo HEAD antes de merge. HML real, RLS, isolamento entre usuários, requisito transversal da sidebar/BRAND-01 e certificação V1 continuam não comprovados.
- **Próxima ação:** reexecutar checks do BUILD #83, resolver eventuais falhas e atualizar este checkpoint com evidências verificadas. Não antecipar certificação.

### GOV-021 — evidências verificadas 05/11/2026
- PLAN PR #88: CI `41957610750` Zero-Drift PASS, Teste C PASS; merge `6607b06573652edd0cba99de3fdf56e97793dc6b`.
- BUILD PR #89: CI `41958140715` Zero-Drift PASS, Teste C PASS; merge `a3ad4c5dc0b38720cb740db838e010ca3636ec05`.
- A varredura ADM-01 foi limitada ao módulo correto, preservando as restrições originais. PR #83 requer novo CI após a integração; não presumir verde nem certificação V1.

### V1-23 — BUILD integrado, evidência de CI (05/11/2026)
- PR #83, HEAD `e4df6316b244a143c9b9dbf1de682104fecd26c1`, execução `41959012094`: **Zero-Drift SUCCESS** e **Teste C Independente SUCCESS**.
- PR #83 integrado à main por merge `66f3a33f15445035aced2b19b7bd354fbc2fb929`. Corrigidos erros de tipagem TypeScript e varredura ADM-01 sem alterar backend.
- **Última etapa comprovada:** BUILD de código V1-23 integrado com dois checks CI verdes; isto não equivale à homologação operacional nem à certificação da V1.
- **Próxima tarefa:** concluir e comprovar requisito transversal P0 da sidebar/AppShell e BRAND-01 (expandida/recolhida, transparência, navegação centralizada, rotas e ativação progressiva), revisão WCAG/identidade visual, e verificar HML real/isolamento, upload e worker conforme pendências formalizadas. Não avançar à V2 sem gate V1.


### P0 transversal sidebar/AppShell — atualização verificada em 05/11/2026
- PLAN P0: PR #98 integrado, execução CI 41962851627 SUCCESS; escopo Zero-Drift validado para o BUILD.
- BUILD inicial: PR #99 integrado, CI 41964388882 SUCCESS; AppShell, sidebar e rotas principais/admin com validação RPC fail-closed.
- PR #101 integrado, CI 41968405315 SUCCESS; preservação das marcas exigidas por brand.test.tsx.
- PR #103 integrado, CI 41969133467 SUCCESS; invalidação do menu ao alterar autenticação.
- PR #105 integrado, CI 41978453275 SUCCESS; revalidação após SIGNED_IN/SIGNED_OUT/USER_UPDATED.
- PR #106 integrado, CI 41978982701 SUCCESS; testes estáticos de invariantes de sessão e navegação.
- PR #107 integrado, CI 41979537498 SUCCESS; diálogo móvel e Escape.
- PR #108 integrado, CI 41983831986 SUCCESS; foco inicial, Tab/Shift+Tab e restauração de foco no menu móvel.
- PR #110 integrado, CI 41989617157 SUCCESS; bloqueio de respostas assíncronas de autenticação obsoletas.
- PR #111 integrado, CI 41990206952 SUCCESS; aria-current e foco visível nas rotas administrativas.
- PR #112 integrado, CI 41997059478 SUCCESS; ícones distintos para módulos comuns recolhidos.
- PR #113 integrado, CI 41997871841 SUCCESS; ícones distintos para módulos administrativos recolhidos.
- PR #114 integrado, CI 41998471755 SUCCESS; revalidação de sessão e permissões ao voltar à aba visível.
- **Evidência limitada:** CI verde e testes estáticos não comprovam WCAG em navegador, HML autenticado, revogação imediata de acesso, isolamento multi-tenant, upload/worker reais ou homologação.
- **Última etapa comprovada:** PR #114 integrado à main com CI verde. **Próxima tarefa:** testes comportamentais de sidebar, revisão visual responsiva/BRAND-01, HML autenticado e isolamento entre organizações; registrar evidências reais antes de certificar V1. Nenhuma certificação ou avanço V2 autorizado.

## Regra canônica P0 — compatibilidade frontend/backend antes de PLAN (05/11/2026)
Decisão expressa do titular: todo prompt/requisito frontend V1–V5 deve ser confrontado com implementação real do backend Supabase HML **antes de aprovação do PLAN ou BUILD**. Matriz por requisito, contrato e evidência verificável. Se faltar backend, **NO-GO**, informar alternativas ao titular: ampliar backend sob autorização específica ou adequar frontend ao backend **sem violar PRD**. Somente o titular decide. Revalidar em mudanças de contrato; não presumir que CI frontend certifica backend. Regra incluída no template de PLAN do frontend.
### Evidências recentes
- PR #123, HEAD `9b21c38d`, CI `42004648753` SUCCESS, merged.
- PR #124, HEAD `9286dffb`, CI `42005441734` SUCCESS, merged.
- PR #125, HEAD `19e1667e`, CI `42005966081` SUCCESS, merged.
- PR #126, HEAD `c80a7147`, CI `42006482450` SUCCESS, merged; tentativa de expandir allowlist backend no frontend **não autorizou SQL**.
- PR #127, HEAD `901e47ea`, CI `42006913109` SUCCESS, merged; restabeleceu fronteira ADR-DEV-002.
- PR #128, HEAD `120b5e8f`, CI `42007393616` SUCCESS, merged; documentou NO-GO de RPC de auditoria.
### Última etapa comprovada e próxima
Última etapa: documentação da divergência entre RLS de `eventos_auditoria` (admin/auditor/jurídico) e navegação (admin), mais bloqueio de backend no manifesto ativo, comprovados. **Próxima:** aprovar e integrar regra P0 do gate FE↔BE; depois, obter decisão expressa do titular sobre a lacuna de autorização da Auditoria antes de PLAN/BUILD correspondente. Nenhuma migration de auditoria foi executada neste fluxo. V1 não certificada; testes autenticados A/B e evidências operacionais ainda pendentes.

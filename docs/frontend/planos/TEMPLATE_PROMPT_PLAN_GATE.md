# TEMPLATE — PROMPT / PLAN / GATE / BUILD / TESTE C (frontend)

## PRIORIDADE ZERO — GATE DE VERSÃO ANTES DE ESCOLHER O PROMPT (P0 OBRIGATÓRIO)

**Ler primeiro** `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md` e `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`. A ordem de desenvolvimento é V1 → certificado V1 → V2 → certificado V2 → V3 → certificado V3 → V4 → certificado V4 → V5 → certificado V5 → regulares transversais e certificação global. **NÃO** seguir numeração 00–99 como sequência automática. Todos os 100 regulares e 97 atômicos continuam obrigatórios e auditáveis.

**Antes de iniciar qualquer PLAN/GATE/BUILD**, declarar:
- Versão atualmente autorizada: **V1 / V2 / V3 / V4 / V5 / GLOBAL**; HEAD e SHA de evidência do último certificado aprovado:
- Próximo prompt regular autorizado conforme o manifesto P0:
- Recibos integrados dos regulares anteriores, atômicos próprios, BRAND-01, 12 NFR transversais e pendências:
- Quando versão anterior não tem certificado PASS e PR integrado: **NO-GO, não prosseguir**, mesmo que próximo número do manual seja de outra versão.
- Neste marco: V1 ainda não certificada; regular 43/V1-22 antes do regular 75/V1-23, depois certificação V1. Só então V2 (44–49,76–77).
- Exigir `node --test scripts/p0-version-order-gate.test.mjs` e `node scripts/p0-version-order-gate.mjs` no CI sem bypass. Os demais gates do template permanecem.


> Copie para `docs/frontend/planos/PROMPT_XX_<data>_<assunto>.md`. **Não modificar código antes do PLAN validado e publicado em commit próprio.**

## A. PROMPT E REFERÊNCIAS
- ID do prompt regular e atômicos vinculados:
- Descrição literal do requisito/FAIL reproduzível:
- Fonte original PRD 4.1, arquitetura, BRAND-01, NFRs, Zero-Drift:
- Dossiê e evidências históricas consultados:
- Baseline SHA e CI do frontend:
- Impacto no backend: **ZERO — somente consumir contratos existentes**.

## B. PLAN — CONTRATO FECHADO DE ESCOPO
- O que será feito / não será feito:
- Arquivos permitidos: **caminhos completos e específicos**, sem curingas desnecessários:
- Arquivos expressamente proibidos: `supabase/**`, `src/integrations/supabase/**`, migrations, RPC/RLS/Edge/Auth/Storage, PROD, segredos.
- Contratos de tipos/RPC já existentes: 
- Design System/BRAND-01: referências e impacto:
- Data/hora BR, BRL, mensagens PT-BR, estados e responsividade:
- Matriz requisito → arquivo → teste → evidência:
- TDD RED → GREEN:
- Testes focados, 812 regressões quando aplicável, lint, typecheck, build e Zero-Drift:
- Teste C independente: 1440/1280/768/390 × claro/escuro, estados, teclado, contraste, capturas e SHA:
- Segurança/controle de acesso: o backend continua autoritativo; não promover MOCK a E2E.
- Plano de rollback, dependências e impactos laterais:

## B.1. TRIAGEM DE POTENCIAL LACUNA BACKEND

- Há possível lacuna em schema, RPC, RLS, Auth, Storage, Edge ou regra de negócio que depende do Supabase? **SIM/NÃO**.
- Se SIM, evidência limitada ao frontend e referências do PRD:
- **Gate obrigatório:** autorização humana pedida para migrar ao fluxo `contaos999999/develop` e investigar HML? **PENDENTE / CONCEDIDA**.
- Enquanto pendente, **BLOQUEAR o trabalho dependente**; não investigar backend nem corrigir por desvio no frontend. Seguir a ADR-DEV-002.

## B.2. CONTEXTO CANÔNICO 4.1 E PROVA 100/97

- Consultar fonte `contaos999999/develop`, registrar **SHA HEAD atual** e confirmar que coincide com `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`. Divergente = PLAN BLOQUEADO até atualizar fonte.
- Declarar `context_pack_version: "4.1"`; `context_read_acknowledged: true`; `context_read_by` e `context_read_acknowledged_at`; `context_source_commit`; `context_catalog_blob` e `context_documents_read` contendo integralmente os 25 arquivos `00–20` e `08A–08D` com fontes e SHAs versionados. Declaração falsa é motivo de reprovação.
- Registrar `prompt_crosswalk.regular_prompt_id` 00–99, `direct_atomic_ids` (incluir 000/BRAND-01 em cada frontend), `additional_transversal_atomic_ids`, `exclusoes_justificadas` quando necessário, `source_evidence_missing: false`, `regular_original_sha256`, `atomic_original_sha256`. **Confirmação numérica NÃO substitui conferência semântica do PRD e da matriz 08A–08D.**
- Registrar `brand_context: "ContaOS Brand v1.0"`, `prompt_000_brand_01_read: true`, `prompt_policy.required_section: "ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE"`.
- Registrar `validacao.gates` individuais `prd, premissas, arquitetura, atomicos, brand, seguranca, nfr, zero_drift, tdd, ci, teste_c_planejado, rollback` como PASS **somente depois da conferência do PLAN e evidências**; `ci_plano_url` com conclusão SUCCESS verificada. Com gate parcial, manter `BLOQUEADO`.
- Em alterações diretas da identidade visual, `validacao.aprovacao_humana_exigida: true`, `aprovacao_humana: "CONCEDIDA"` e `aprovacao_humana_evidencia` realmente verificável. A aprovação geral do agente não substitui esse aceite.
- Declarar `impacto_visual: "SIM"` com matriz 4×2 ou `"N/A"` com justificativa adequada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.

Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.

Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.

## C. VALIDAÇÃO BLOQUEANTE
| Gate | Resultado | Evidência verificável |
| --- | --- | --- |
| PRD 4.1 e prompt original | PENDENTE | |
| Escopo frontend, zero backend/PROD/types | PENDENTE | |
| Atômicos/NFRs/Zero-Drift | PENDENTE | |
| BRAND-01, reutilizar > estender > criar | PENDENTE | |
| Contratos e permissões já existentes | PENDENTE | |
| TDD, segurança, testes, CI e rollback | PENDENTE | |
| A11y, PT-BR, responsividade e Teste C | PENDENTE | |
| Aprovação humana, quando obrigatória | PENDENTE / N/A | |

- Decisão: **NÃO VALIDADO / VALIDADO / REPROVADO / BLOQUEADO**
- Validador, data/hora Brasília e referência do SHA:
- PLAN commit exclusivo e CI SUCCESS:
- Atualizar separadamente `PLANO_ATIVO.json` para `VALIDADO`, com arquivos permitidos. **Não incluir BUILD no mesmo commit.**

## D. BUILD / TESTE C (somente após gate VALIDADO)
- SHA do BUILD, arquivos reais modificados e diff:
- TDD RED/GREEN e testes:
- CI SHA final:
- Zero-Drift e hash `types.ts`:
- Teste C independente e capturas duráveis:
- Resultado por critério: PASS/FAIL/NÃO VERIFICADO:
- Divergência descoberta e novo PLAN, se houver:
- Registro no dossiê e checkpoint para novo chat:


> Nota de migração 04/11/2026: os nomes canônicos agora pertencem à organização `contaos999999`. O ruleset da main exige PR e dois status checks, com `required_approving_review_count=0`, mas aprovações de PLAN explicitamente obrigatórias (por exemplo, BRAND-01) permanecem exigíveis. Consultar `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` antes de preencher.


## GOV-020 — geração TanStack para prompts com rotas (OBRIGATÓRIO QUANDO APLICÁVEL)

- Criará, alterará nome ou removerá arquivos de `src/routes/`? **SIM / NÃO**. Se SIM, `src/routeTree.gen.ts` deve constar na allowlist e ser gerado por `bunx vite build`, nunca editado manualmente.
- Para BUILD de rotas, confirmar resultado real de `node scripts/route-tree-drift-gate.mjs` após o commit da árvore gerada; registrar SHA da branch e teste negativo com drift que retorne FAIL. Não criar gate PASS por evidência fictícia.
- CI deve executar build/gerador antes dos testes longos, em seguida comparar a árvore com o Git. Teste C repete a verificação após Vite dev e preserva conferência final de integridade.
- Se GOV-020 FAIL, PLAN/BUILD **não está pronto para integração**, mesmo com Vitest, TypeScript, browser ou build PASS. Não desabilitar o gate nem editar `routeTree.gen.ts` manualmente. Não usar `git add`/commit automáticos no CI.
- Referência: `docs/frontend/governanca/GOV_020_GERACAO_DETERMINISTICA_ROTAS_2026-11-04.md`.

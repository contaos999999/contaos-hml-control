# TEMPLATE — PROMPT / PLAN / GATE / BUILD / TESTE C (frontend)

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
- **Gate obrigatório:** autorização humana pedida para migrar ao fluxo `contaos9999/develop` e investigar HML? **PENDENTE / CONCEDIDA**.
- Enquanto pendente, **BLOQUEAR o trabalho dependente**; não investigar backend nem corrigir por desvio no frontend. Seguir a ADR-DEV-002.

## B.2. CONTEXTO CANÔNICO 4.1 E PROVA 100/97

- Consultar fonte `contaos9999/develop`, registrar **SHA HEAD atual** e confirmar que coincide com `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`. Divergente = PLAN BLOQUEADO até atualizar fonte.
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

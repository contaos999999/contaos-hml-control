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

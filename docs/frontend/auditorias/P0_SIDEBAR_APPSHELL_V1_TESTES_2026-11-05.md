# Auditoria consolidada P0 — sidebar/AppShell V1 — 05/11/2026

## Método e limites
Análise de código de `ContaOSAppShell.tsx`, `ContaOSSidebar.tsx`, `menuV1.ts`, `PLANO_ATIVO.json`, PLAN P0 e testes existentes na `main`, após PR #118. Evidência de CI verde dos PRs #98–#118, mas **nenhum ensaio autenticado HML ou inspeção visual foi realizado nesta auditoria**. Não certificar V1. A política de desenvolvimento passa a ser auditoria completa, matriz de lacunas, BUILD agrupado, bateria de testes e checkpoint, em vez de um PR por detalhe.

## Matriz de lacunas e ações consolidadas
| Prioridade | Constatação | Ação de BUILD / validação | Aceite |
|---|---|---|---|
| P0 | `liberado=true` ocorre antes de `validarAdministrador` terminar; a preferência local de organização não é autorização | Manter menu comum sem inferir acesso a dados; RPC fail-closed; provar guards/RLS de cada rota em HML | usuário sem organização ou sessão não obtém acesso; perfil comum não acessa ADM |
| P0 | A mudança de organização é armazenada em `sessionStorage` e não emite evento de atualização do shell; a revalidação atual depende de rota, autenticação ou visibilidade | Definir contrato de mudança de organização e revalidação imediata, com invalidação de cache por tenant; alterar arquivo fora da allowlist somente após novo PLAN | trocar A→B não mantém menu/dados de A, inclusive com a mesma rota |
| P0 | Revogação de papel enquanto aba permanece ativa não gera revalidação imediata; retorno de aba revalida | Preservar fail-closed backend/RLS; definir evento/política de refresh e testes de revogação, sem prometer detecção instantânea sem mecanismo | requisições indevidas negadas por RLS; menu atualizado após evento de revalidação |
| P1 | Drawer tem foco circular, Escape, `inert`, scroll lock, mas não há testes DOM reais | Adicionar testes React Testing Library com mock auth/router, abertura/fechamento, foco, Tab, Escape, `inert`, rolagem e restauração | testes comportamentais verdes no CI |
| P1 | Foco restaurado no cleanup mesmo em desmontagem/troca de rota; pode focar elemento de contexto anterior | Ajustar restauração somente em fechamento pertinente; testar logout e navegação | foco permanece coerente após logout/rota |
| P1 | Drawer aberto e mudança para desktop não fecha explicitamente; `md:hidden` pode ocultar diálogo com `inert` ainda ativo | Fechar ao cruzar breakpoint com `matchMedia` e validar navegação responsiva | conteúdo não fica inerte ao passar de mobile para desktop |
| P1 | Ícones, logo e rótulos desktop dependem de classes condicionais; inspeção visual real pendente | Verificar BRAND-01 transparente, tema claro/escuro, 320/375/768/1440, contraste, clipping, leitor de tela | evidências por viewport/tema e teclado |
| P1 | Testes atuais de auth são predominantemente leitura de código, não execução de comportamento | Complementar, não substituir, invariantes estáticas com testes de corrida async e troca de sessão | callbacks antigos não exibem sidebar/admin |
| P1 | Cabeçalhos e marcas de telas V1 continuam locais para preservar `brand.test.tsx` | Auditar duplicações visuais reais antes de mexer; não remover `ContaOSMarca` sem ajustar contrato normativo | sem sobreposição ou regressão BRAND-01 |
| P0 externo | Isolamento multi-tenant, upload/worker, autorização e WCAG real sem evidência HML | Executar matriz autenticada A/B e fluxo real em ambiente autorizado; registrar logs/redações sem segredos | evidência verificável antes da certificação |

## Plano de execução agrupado
1. **PLAN separado**: confrontar matriz com fontes canônicas e confirmar allowlist. Escopo atual permite AppShell, Sidebar, menuV1, testes e checkpoint, mas **não** autoriza modificar `preferenciaOrganizacao.ts` ou testes de integração fora da lista. Se necessário, novo PLAN validado antes do BUILD.
2. **BUILD único** para as correções compatíveis autorizadas: breakpoint desktop, restauração de foco, testes comportamentais, segurança de revalidação e ajustes de navegação. Não editar marca nem backend.
3. **CI completo** no HEAD exato: Zero-Drift, Teste C, build, typecheck, lint, Vitest; reparar falhas no mesmo PR.
4. **HML autenticado**: matriz de papéis, organizações A/B, logout, revogação, teclado, responsividade e upload/worker reais; registrar limitações.
5. **Checkpoint**: HEAD, PR, CI, evidências, pendências e próxima etapa. V1 somente certificada com todos os gates comprovados.

## Decisão de governança
Regra de execução: **auditar integralmente → planejar integralmente → implementar em conjunto → testar integralmente → certificar com evidências**. Não fragmentar em PRs de ajustes isolados quando um conjunto compatível já puder ser previsto. Preservar PLAN/BUILD, gates Zero-Drift e sequência por V1, V2, V3, V4 e V5.

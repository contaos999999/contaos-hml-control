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

## Inspeção complementar pós-PR #120 (05/11/2026)
- PR #120 HEAD `406a2045631ab3ae283070be4334b7a33a3c71dd`, workflow `42002691495` SUCCESS, integrado à `main`. Isto comprova CI, **não** teste HML autenticado.
- `OrganizationSelector.tsx` já valida a organização selecionada contra os vínculos retornados por `listarOrganizacoesDisponiveis()`, compara preferência anterior e executa `queryClient.clear()` ao trocar A→B. **Não implementar novamente esta limpeza**. Há, porém, lacuna de prova para navegação com requisições em voo, revalidação imediata do shell na mesma rota e isolamento real no backend.
- `preferenciaOrganizacao.ts` mantém preferência de sessão vinculada ao ID de usuário e declara expressamente que não é fonte de autorização. Alteração desse arquivo não consta da allowlist P0 atual; requer PLAN atualizado e validado se necessária.
- `TrilhaAuditoria.tsx` consulta `obterEventosAuditoria` com `idOrganizacao` e tratamento de erro, mas não invoca `validarAdministrador` explicitamente antes da consulta. A exibição do link no AppShell é condicionada ao RPC admin; a proteção efetiva da rota direta precisa de matriz canônica e RLS autenticado. Não inferir vulnerabilidade comprovada nem permissão por simples presença da URL.
- A maior lacuna de qualidade dos testes permanece: `appShellSidebar.test.tsx` usa verificações estáticas de strings; não comprova foco real, autenticação concorrente, acessibilidade WCAG nem troca A/B. O próximo pacote deve priorizar testes comportamentais e autorização, **não** novos ajustes estéticos.
- Decisão: **não** certificar V1 e **não** afirmar isolamento multi-tenant comprovado; agrupar eventual ampliação de allowlist em PLAN próprio antes do BUILD.

## Evidência direta Supabase HML — RLS da auditoria (05/11/2026)
Projeto HML identificado via conector Supabase: `gklhhhyosgasnyoxlrui`, estado ACTIVE_HEALTHY. Inspeção **somente leitura** de `pg_class`, `pg_policy` e `pg_get_functiondef`:
- `public.eventos_auditoria`: `relrowsecurity=true`, política SELECT `eventos_select` com expressão `privado.usuario_possui_perfil(id_organizacao, ARRAY['administrador','auditor','juridico_conformidade'])`.
- `privado.usuario_possui_perfil`: função `STABLE SECURITY DEFINER`, `search_path=''`, exige `privado.sessao_usuario_ativa()`; aceita administrador master quando solicitado perfil administrador ou vínculo ativo do `auth.uid()` à organização, com início vigente, fim não expirado e perfil autorizado.
- `public.organizacoes`: `relrowsecurity=true`, política SELECT `organizacoes_select` usa `privado.usuario_tem_acesso_organizacao(id)`, que também exige sessão ativa e vínculo vigente ou master.
- **Desvio funcional comprovado por código + política:** AppShell mostra ambos os links `Usuários` e `Auditoria` somente quando `validarAdministrador` retorna true; RLS autoriza `auditor` e `juridico_conformidade` a ler auditoria, mas esses perfis não veem o link. Não há evidência de vazamento: a rota direta continua sujeita ao RLS.
- **Remediação planejada:** separar capacidades `podeGerenciarUsuarios` e `podeConsultarAuditoria` com verificação confiável, sem ampliar permissões de banco; manter a rota `Usuários` restrita ao administrador. Evitar confiar em `sessionStorage` como autorização. Exige PLAN/allowlist explícito se alterar RPC, helper ou teste fora da lista atual.
- **Limitação:** inspeção de metadados SQL não equivale a testes autenticados com identidades A/B, nem demonstra a ausência de vazamento em todos os recursos. Certificação V1 continua bloqueada.

## PLAN técnico — autorização da navegação de auditoria, inspeção RPC HML
Inspeção SQL read-only de `pg_proc` e `has_function_privilege` no projeto HML:
1. `public.validar_administrador_organizacao(uuid)` retorna `boolean`, executável por `authenticated`; chama `privado.validar_administrador_organizacao(uuid)`, que falha com SQLSTATE `42501` quando o usuário não tem perfil administrador.
2. `privado.usuario_possui_perfil(uuid,text[])` já implementa as regras efetivas de vínculo e sessão usadas pela RLS de `eventos_auditoria`, mas está no schema privado. **Não** expor o schema privado ao cliente e **não** inferir autorização a partir de preferência local.
3. Não foi encontrada RPC pública existente para testar diretamente a capacidade `administrador|auditor|juridico_conformidade`. A correção completa precisa de uma RPC pública **somente leitura**, por exemplo `pode_consultar_auditoria_organizacao(uuid) RETURNS boolean`, que delegue a `privado.usuario_possui_perfil` e seja concedida somente a `authenticated`, com `search_path` restrito, sem expor dados sensíveis.
4. Frontend deve consultar separadamente a RPC admin existente e a nova RPC de auditoria, ocultar cada link até retorno positivo, invalidar resultados em mudança de sessão/organização, e continuar dependendo da RLS em todas as consultas. Tratar erro de RPC como negação temporária do menu, não como autorização.
5. **Governança:** backend SQL/migrations, `src/lib/administracao/admUsuariosRpc.ts` e testes de integração fora da allowlist do PLAN ativo. Exige PLAN de escopo expandido, gates Zero-Drift e BUILD separado antes de editar esses arquivos. Não aplicar DDL diretamente no HML sem migração versionada e CI. Não modificar a política `eventos_select`.
6. **Critérios de aceite:** perfil administrador vê Usuários e Auditoria; auditor/jurídico vê apenas Auditoria; perfil não autorizado não vê nenhum; RPC falha fechada; testes A/B autenticados no HML com dados e vínculos de teste, incluindo leitura cruzada negada; evidência de build, testes, migração, CI, checkpoint.
**Estado:** plano proposto, não implementado nem certificado. Evidências de metadata SQL não substituem testes autenticados.

## Bloqueio confirmado na fonte canônica backend (05/11/2026)
Inspeção de `contaos999999/develop` em `main`, sem mutações:
- `00_AI_LEIA_ANTES_DE_ALTERAR.md`: exige leitura integral das 25 fontes, manifesto específico, prova da lacuna, migration nova, testes A/B, rollback e autorização explícita para modificar backend certificado.
- `docs/tasks/active-task.json`: tarefa `RNF-AUD-001-STATIC-20261104` em fase `build_estatico_sem_servicos`, `database_changes_allowed=false`, `rls_changes_allowed=false`, `auth_changes_allowed=false`; `supabase/**` está em `forbidden_paths`. A autorização histórica para funções V1-17 é específica e **não** abrange uma nova RPC de auditoria.
- `05_BACKEND_SUPABASE_CERTIFICADO_4_1.md` e `docs/CERTIFICACAO_BACKEND_HML_4_1.md` registram certificação anterior e exigem mudanças incrementais e testes de restore. Esses registros históricos não comprovam a nova capacidade.
**Decisão NO-GO:** não criar migration nem executar DDL usando a tarefa RNF atual. Abrir PLAN backend dedicado, após conferência de 25 documentos e validação do gate/autorização humana específica quando exigida; preservar a tarefa RNF em andamento sem sobrescrever seu manifesto. Não alterar frontend até contrato HML novo estar certificado. **A V1 segue não certificada.**

## Auditoria consolidada V1 — rodada do plano mestre PR #130 (05/11/2026)
**Baseline verificado:** PR #130 merged, CI 42013946647 SUCCESS. `PLANO_ATIVO.json` ainda aponta prompt 75, status `EM_VALIDACAO`; **não** promover a BUILD sem gate de escopo e matriz canônica concluída.

### Matriz FE ↔ BE — lacuna objetiva V1-23
| Requisito | FE main inspecionado | Backend HML comprovado | Veredito |
|---|---|---|---|
| Menu Usuários admin-only | `ContaOSAppShell.tsx` usa `validarAdministrador` e `MENU_ADMIN_V1` | `validar_administrador_organizacao` | PASS de contrato; E2E não verificado |
| Menu Auditoria admin/auditor/jurídico | Mesmo boolean `administrador` controla os dois links no desktop e móvel | `pode_consultar_auditoria_organizacao(uuid)` implantada HML, PR backend #49 certificação condicionada | **FAIL funcional FE**: auditor e jurídico sem link |
| Transporte de capacidade Auditoria | `admUsuariosRpc.ts` só contém `validarAdministrador`; não possui wrapper para nova RPC | RPC `authenticated`, retorna boolean e falha fechada | **FAIL funcional FE** |
| Sessão/org invalidation | AppShell incrementa geração no SIGNED_IN/OUT, USER_UPDATED, visibilidade, pathname; revalida admin | Sessão ativa e vínculos são exigidos pelo backend | PASS estático; comportamento concorrente E2E não verificado |
| RLS de eventos de Auditoria | Trilha consulta dados, não deve inferir autorização pelo menu | `eventos_select` por admin/auditor/jurídico e sessão ativa | PASS estrutural backend; RLS autenticada A/B não executada |

### Correção agrupada sob plano mestre, sem BUILD prematuro
1. Separar capacidades `podeGerenciarUsuarios` e `podeConsultarAuditoria`, adicionando wrapper RPC boolean estrito, erro = false, sem tocar backend.
2. Desktop e móvel: menu Usuários somente admin, Auditoria admin/auditor/jurídico; invalidar ambos em sessão, organização e respostas obsoletas.
3. Criar testes comportamentais de permissões, A/B, foco/teclado, rota direta, race e falha RPC; preservar marca BRAND-01.
4. Primeiro atualizar/validar `PLANO_ATIVO.json` e allowlist, confirmar catálogo 100/97 e HEAD canônico, aprovar PLAN pelo CI; depois BUILD agrupado. Sem prova de backend para outra função, NO-GO e consulta ao titular.
5. Persistem como NÃO VERIFICADO: WCAG em navegador, upload/worker real, HML JWT A/B, restore, recuperação Auto-Lock e sincronização Lovable. A dispensa expressa anterior cobre **somente** certificação condicionada V1-23 backend, não esses itens automaticamente.

### Verificação HML direta após merge PR #132 — 05/11/2026
Consulta somente leitura a `pg_proc` e `has_function_privilege` no projeto HML `gklhhhyosgasnyoxlrui` confirmou:
- `public.pode_consultar_auditoria_organizacao`: existe, SECURITY INVOKER (`prosecdef=false`), STABLE (`provolatile=s`), EXECUTE authenticated=true, anon=false.
- `public.validar_administrador_organizacao`: existe, SECURITY INVOKER, STABLE, EXECUTE authenticated=true, anon=false.
- Ambas as capacidades possuem contrato backend existente; nenhum DDL foi executado. A autorização efetiva por JWT e o isolamento A/B **não foram comprovados** por essa consulta.
- Gate de BUILD frontend permanece `EM_VALIDACAO` em `PLANO_ATIVO.json`; não alterar código antes de fechar as verificações canônicas, testes planejados e CI do PLAN. A correção deve reutilizar a RPC implantada, nunca ampliar privilégios.

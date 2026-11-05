# PLAN P0 — Sidebar e AppShell global da Versão 1

**Estado: PROPOSTO, NÃO VALIDADO.** Este documento não autoriza BUILD até aprovação do PLAN, conferência das fontes canônicas e CI verde. Não renumerar os prompts regulares 00–99 ou atômicos 000–096. Esta é uma correção transversal de navegação da V1, obrigatória antes de sua certificação.

## Diagnóstico verificado no frontend
- `src/routes/__root.tsx` renderiza `<Outlet />` diretamente sob `QueryClientProvider`, sem AppShell global.
- `src/components/brand/ContaOSMarca.tsx` já referencia variantes transparentes horizontal e símbolo; falta integração de estados expandido/recolhido da sidebar.
- `src/routes/index.tsx` e `src/routes/contratos.tsx` usam TanStack Router; preservar tipagem, rotas geradas e redirecionamentos.

## Escopo planejado
1. Criar um AppShell compartilhado para páginas autenticadas, sem exibir sidebar em login, recuperação de acesso e seleção inicial de organização. Identificar precisamente todas as rotas públicas antes do BUILD.
2. Implementar sidebar responsiva com expansão/recolhimento, navegação por teclado, foco visível, rótulos acessíveis, indicação de rota ativa, drawer móvel com fechamento e sem overflow horizontal.
3. Aplicar BRAND-01 com arquivos oficiais transparentes, variantes por tema e símbolo na sidebar recolhida; **não editar os arquivos da marca** sem aprovação humana específica.
4. Centralizar catálogo de navegação e controlar ativação progressiva dos módulos por versão; itens futuros não podem criar acesso indevido ou rotas falsas. Autorização efetiva permanece no backend/RLS, nunca apenas na visibilidade do menu.
5. Preservar organização selecionada, sessão e logout; impedir vazamento entre organizações, inclusive em troca de contexto e cache.
6. Usar mensagens e acessibilidade em pt-BR, datas/horários padrão Brasília quando exibidos, layouts claro/escuro e larguras 320, 375, 768 e 1440 px.
7. Testar navegação, rotas públicas, sidebar expandida/recolhida, responsividade, foco, acesso por teclado, identidade visual, permissões, estados vazios e regressão das telas V1.

## Arquivos candidatos (a confirmar após inventário de rotas)
- `src/routes/__root.tsx`
- `src/components/layout/ContaOSAppShell.tsx` (novo)
- `src/components/layout/ContaOSSidebar.tsx` (novo)
- `src/lib/navegacao/menuV1.ts` (novo)
- `src/test/appShellSidebar.test.tsx` (novo)
- `src/routeTree.gen.ts` somente quando gerado deterministicamente pelas rotas aprovadas.
- Documentos de testes e checkpoint oficial.

## Gates obrigatórios
- Leitura e rastreabilidade de todos os 25 documentos canônicos do repositório `contaos999999/develop`, fingerprints, cruzamento de prompt regular e atômicos, requisitos não funcionais e BRAND-01.
- PLAN formal `PLANO_ATIVO.json` VALIDADO **em commit anterior ao primeiro BUILD**, com allowlist exata, seção literal Zero-Drift, validação de planejamento e CI; nenhuma exceção ampla ao scope gate.
- Revisão de risco de rotas públicas e autorização por organização; sem alteração de backend, Supabase HML ou PROD.
- CI Zero-Drift e Teste C verdes no SHA exato; evidência visual e teclado; rollback documentado.
- Certificação V1 permanece bloqueada até evidências reais dos requisitos transversais e pendências operacionais formalizadas.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Não alterar marca, tokens, layout de telas existentes ou comportamento de negócio além do escopo aprovado; minimizar alterações e verificar diferenças de identidade visual em todas as larguras e temas.

## Próximo passo
Conferir inventário completo das rotas e arquivos de navegação, fontes normativas e matriz de acesso. Completar PLAN ativo, obter gates de planejamento e só então criar branch de BUILD. **Nenhum teste ou homologação é considerado executado por este documento.**

## Inventário de rotas encontrado no repositório (pesquisa por createFileRoute)
**Públicas, sem sidebar:** `/login`, `/esqueci-senha`, `/redefinir-senha`; `/selecionar-organizacao` é etapa de autenticação/contexto e não deve exigir organização já selecionada.

**Navegação principal V1:** `/` (dashboard), `/contratantes`, `/contratos`, `/administracao/usuarios` e `/administracao/auditoria` (esta última confirmada no BUILD #83). Não apresentar links de páginas V2–V5 como ativas.

**Rotas contextuais, não itens de menu global:** novo/editar contratante; novo/detalhe de contrato; regras, orçamento, histórico, importação histórica, documentos e detalhe, competências e criação, base normativa; detalhe de competência, documentos, análise, parecer, apresentação e detalhe de apresentação. A navegação entre essas páginas permanece contextual ao contrato/competência.

**Risco identificado:** `__root.tsx` não possui autenticação global, portanto o AppShell não pode presumir que toda rota diferente das quatro públicas está autorizada. Deve preservar verificações de sessão, organização e permissões existentes sem criar flash de conteúdo privado. Auditoria e administração devem ter autorização específica e não apenas ocultação de links.

**Próxima checagem antes de VALIDADO:** conferir `routeTree.gen.ts` para a lista exata e os nomes das rotas dinâmicas, inspecionar proteção das rotas ADM, autorização por organização e componentes atuais de cabeçalho. Em seguida congelar allowlist do PLAN ativo e executar os gates de planejamento. Nenhuma implementação está autorizada por este inventário.

## Conferência técnica da árvore gerada e das rotas ADM (05/11/2026)
- `src/routeTree.gen.ts` contém **29 rotas** (incluindo raiz, rotas públicas e contextuais) e confirma os caminhos literais `/administracao/usuarios` e `/administracao/auditoria`.
- As duas rotas administrativas usam `component: AdminUsuarios` e `component: TrilhaAuditoria` e `ssr: false`. A proteção não é declarada em `beforeLoad` nessas rotas; a autorização é delegada aos componentes e ao backend. O AppShell não deve assumir autorização administrativa com base apenas na URL.
- `Dashboard.tsx` já contém cabeçalho próprio, marca, seleção de organização e ação de sair; migrar essas funções ao shell exige revisão de regressão e prevenção de cabeçalhos duplicados. Não remover proteções de sessão existentes sem cobertura equivalente.
- O catálogo do menu deve usar **somente** as rotas estáticas existentes e evitar itens dinâmicos `/$id` sem contexto. Menu de Administração condicionado a permissões efetivamente verificadas; ocultação visual não concede nem revoga autorização.
- **Pendente de comprovação:** inspeção completa das verificações de permissão dos componentes ADM, dos cabeçalhos das demais telas e matriz canônica de papéis. Não registrar PLAN VALIDADO nem iniciar BUILD antes disso.

## Correções obrigatórias identificadas na inspeção dos componentes
1. **ADM-01:** `AdminUsuarios.tsx` valida sessão e organização, depois usa `validarAdministrador(org)` e só habilita a consulta de usuários quando `admin === true`. O menu Administração/Usuários só deve aparecer após verificação equivalente, nunca por presunção de perfil; manter RPC e estados de acesso negado.
2. **V1-23 Auditoria:** `TrilhaAuditoria.tsx` verifica sessão/organização e consulta `obterEventosAuditoria`; não contém a mesma verificação explícita `validarAdministrador` do ADM-01. **Não inferir que auditoria é acessível a todo usuário**: antes de exibir link, definir a política de acesso a partir da matriz canônica e da autorização real da consulta, com tratamento de 401/403 e RLS. A ausência de guard frontend não prova falha do backend.
3. **Cabeçalhos duplicados:** `Dashboard.tsx`, `ListaContratos.tsx` e `AdminUsuarios.tsx` já renderizam `<header>` com `ContaOSMarca` e ações. `TrilhaAuditoria.tsx` também exibe `ContaOSMarca` no cabeçalho interno. BUILD deve migrar de forma controlada ações globais para AppShell e deixar títulos locais, sem duplicação de marca/ações.
4. **Logout/contexto:** `Dashboard.tsx` e `AdminUsuarios.tsx` chamam `supabase.auth.signOut()`; preservar comportamento e não limpar dados de outra organização apenas visualmente. Garantir limpeza/invalidação de cache após troca de organização ou saída, com testes.
5. **Sequência de implementação segura:** (a) catálogo de rotas e teste de rotas públicas, (b) shell condicionado à sessão/contexto, (c) marca responsiva, (d) migração dos cabeçalhos por tela, (e) permissão ADM, (f) teste visual/teclado, (g) regressão/CI. Não marcar VALIDADO até o cruzamento normativo e PLAN ativo.

## Evidência de integração do PLAN ativo (05/11/2026)
- PR #93 integrado na `main`, merge `949403669ca87d1040149ef5d99d38e17b2ce2b2`.
- CI no HEAD `1e3632e053987a67d808e20f2c5fe6ba5e8b7f77`: execução `41961117302`, conclusão **SUCCESS**.
- Jobs: `ContaOS Frontend Zero-Drift` **SUCCESS** e `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente` **SUCCESS**.
- `PLANO_ATIVO.json` na main: `status=EM_VALIDACAO`, `validacao.resultado=PENDENTE`, doze gates `PENDENTE`; allowlist P0 fechada. **Os jobs acima validam o commit de governança, não o BUILD da sidebar.**
- **Pendências antes de marcar VALIDADO:** (1) confrontar cada requisito e cada permissão com as 25 fontes canônicas e crosswalk 100/97, (2) revisar o vínculo do plano transversal com `prompt_id=75` sem falsear escopo original, (3) demonstrar gates de planejamento individuais, (4) registrar URL de CI do PLAN e aprovação conforme política, (5) fechar estratégia de autorização e de cabeçalhos. Nenhum gate individual é considerado PASS por inferência do CI.
- **Rollback do PLAN:** reverter o commit de atualização do `PLANO_ATIVO.json` mediante PR e CI, restaurando o PLAN anterior se necessário. BUILD ainda proibido.

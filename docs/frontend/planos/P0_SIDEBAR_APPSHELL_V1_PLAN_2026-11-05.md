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

## Matriz de rastreabilidade e autorização: inspeção de código (05/11/2026)
| Item | Evidência no repositório | Regra para BUILD | Estado |
|---|---|---|---|
| BRAND-01 | `src/components/brand/ContaOSMarca.tsx`: horizontal branco transparente/navy por tema; símbolo branco/navy no mobile | Reutilizar arquivos oficiais; não modificar assets sem aprovação; conferir legibilidade na sidebar recolhida | Código inspecionado, visual pendente |
| ADM-01 | `src/lib/administracao/admUsuariosRpc.ts`: classificação 401/403, 42501 e PGRST301 como acesso negado; backend/RLS autoridade | Exibir link administrativo somente após `validarAdministrador` ou política canônica equivalente; não inferir permissão da rota | Código inspecionado, HML pendente |
| V1-23 | `src/lib/administracao/auditoriaDados.ts`: consulta `eventos_auditoria` filtrada por `id_organizacao`, erros 42501/PGRST301 tratados | Não mostrar link auditoria indiscriminadamente; confirmar matriz de papéis e RLS com teste autenticado entre organizações | Código inspecionado, matriz/HML pendentes |
| Navegação | `src/routeTree.gen.ts`: 29 rotas; `__root.tsx` sem AppShell | Preservar rotas públicas, contexto de organização e 29 rotas existentes | Inventário concluído |
| Fonte canônica | Snapshot `CONTEXT_CANONICO_4_1_SNAPSHOT.json`, commit normativo `c2bf86d011da6bfd3abaa70de38e7a722ae629de`; Prompt 75 mapeado a 000/020/021/022/023 | Não alterar catálogo, não alegar que sidebar é escopo original do 75; requisito transversal P0 | Conferência estrutural, leitura normativa individual pendente |

**Limite de evidência:** inspeção estática e CI do PLAN não comprovam autorização real em HML, isolamento entre usuários, WCAG, nem cobertura dos 25 documentos canônicos. Manter gates pendentes até comprovação específica. A exigência de PLAN VALIDADO em commit anterior ao BUILD permanece integral.

## Conferência de acesso às 25 fontes canônicas (05/11/2026)
Foram recuperados via GitHub, na revisão normativa fixa `c2bf86d011da6bfd3abaa70de38e7a722ae629de`, os 25 documentos listados em `PLANO_ATIVO.json.context_documents_read`: 00, 01, 02, 03, 04, 05, 06, 07, 08, 08A, 08B, 08C, 08D, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 e 20. Não houve erro de recuperação nesta rodada.

**Evidências normativas pertinentes, conferidas no texto recuperado:**
- `00_AI_LEIA_ANTES_DE_ALTERAR.md`: bloqueia alterações antes da leitura integral do pacote canônico.
- `01_PRD_MESTRE_4_1.md`: autorização no backend, nunca somente na interface.
- `03_ARQUITETURA_OFICIAL_4_1.md`: não contornar autorização; preservar fronteiras arquiteturais.
- `05_BACKEND_SUPABASE_CERTIFICADO_4_1.md`: backend certificado não deve ser recriado ou simplificado sem requisito e autorização.
- `06_FRONTEND_LOVABLE_ESPECIFICACAO_4_1.md`: navegação por teclado, autorização e BRAND-01 transversal estritamente visual.
- `07_ZERO_DRIFT_GOVERNANCA_4_1.md`: Plan Mode antes do Build, escopo fechado e frontend não é autoridade de segurança.
- `08D_REQUISITOS_073_096_4_1.md` e `11_RNF_PERFORMANCE_CONCORRENCIA_RESILIENCIA_4_1.md`: transferência autorizada e isolamento do Storage, sem alterações neste PLAN.
- `12_PROMPTS_PROTOCOLO_IMPLEMENTACAO_4_1.md`: prompts não autorizam reinterpretar PRD; BRAND-01 não altera rotas, regras ou autenticação.
- `14_CHECKLIST_PRE_ALTERACAO.md`: autorização backend efetiva e alterações de RLS/DDL/Auth dependem de autorização específica.
- `18_SCHEMA_RLS_EDGE_QUEUES_CRON_4_1.md`: leitura não implica autorização para aprovação.
- `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md`: marca complementa o pacote 4.1, sem prevalecer sobre arquitetura, navegação ou acessibilidade.
- `20_PROMPT_000_BRAND_01.md`: marca exclusivamente visual, proibição de mudanças funcionais no escopo BRAND-01.

**Distinção de evidências:** a recuperação das 25 fontes e a identificação de trechos relevantes não substituem auditoria semântica integral item a item, nem comprovam testes autenticados de RLS ou autorização. O plano transversal de navegação não deve ser rotulado como BUILD do BRAND-01 isolado; precisa de autorização funcional de navegação específica. O `prompt_id=75` é âncora técnica herdada, não prova de correspondência funcional da sidebar. Até resolução dessa lacuna de rastreabilidade, manter `PLANO_ATIVO.json` como `EM_VALIDACAO` e gates pendentes. Não iniciar BUILD.

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

# P0 V1 — Emenda ao plano mestre: sidebar, BRAND-01, MASTER e RBAC

**Data:** 05/11/2026. **Origem:** issue #166 e captura fornecida pelo titular. **Status:** PLAN PROPOSTO, não BUILD nem certificado. Vinculado ao plano mestre `P0_V1_PLANO_UNICO_AUDITORIA_CORRECAO_CERTIFICACAO_2026-11-05.md`, sem alterar seu sequenciamento.

## Evidências verificadas
- `src/lib/navegacao/menuV1.ts` contém somente Painel, Contratantes, Contratos, Usuários e Auditoria; não inventaria os CRUDs existentes.
- `src/components/layout/ContaOSSidebar.tsx` mostra somente `MENU_V1`; `ContaOSAppShell.tsx` adiciona links administrativos separados.
- `ContaOSAppShell.tsx` usa logo branca no tema claro e navy no tema escuro, potencialmente invisíveis sobre os fundos correspondentes. Captura mostra ausência da marca.
- `AdminUsuarios.tsx` obtém `perfis_disponiveis`, sem evidência de uma matriz editável perfil × recurso × ação.
- A imagem não prova por si só que as rotas ou as RPCs inexistam; é necessária inspeção do catálogo e do backend.

## Fontes e limites
P0 ordem por versão, índice ZIP mestre, checkpoint, plano ativo, `AGENTS.md` e regra de CI foram consultados. A leitura integral contemporânea dos 25 documentos normativos, a recuperação do ZIP literal e o inventário de rotas/backend **ainda não foram concluídos nesta emenda**. Não marcar GATE PASS nem iniciar BUILD até suprir esses requisitos. Nenhuma alteração de PROD, tipos congelados, Supabase ou permissões nesta fase.

## Fase A — inventário obrigatório e contrato de autorização
1. Levantar rotas reais V1 e componentes CRUD de organizações, contratantes, contratos, documentos, administração e auditoria; cruzar com os 45 regulares e 25 atômicos BRAND/V1.
2. Conferir em `contaos999999/develop` e HML a definição real de MASTER (global ou organizacional), perfis existentes, `validar_administrador_organizacao`, grants/RLS e política de acesso por ação. Não assumir que master é `admin`, nem confiar em `user_metadata`, e-mail ou sessionStorage.
3. Levantar `perfis_disponiveis` e permissões realmente persistidas. Não conceder direitos à Contabilidade por adivinhação.
4. Se o backend não oferece gestão de permissões granulares, registrar lacuna de contrato e PLAN backend separado; nenhum fallback inseguro no frontend.

## Fase B — BUILD frontend condicionado a GATE
- Catálogo central de rotas V1 com grupos e links de CRUD existentes, inclusive acesso direto a cadastro de organização/contrato para MASTER validado no backend; menu dinâmico por capacidades de cada recurso/ação.
- Aplicar exclusivamente SVG/PNG BRAND-01 oficiais, logo navy transparente em fundo claro, branca transparente em escuro, símbolo em menu recolhido; verificar assets existentes e evitar duplicação.
- Menu expandido/recolhido e drawer móvel com scroll, indicador de ativo, skip-link, headings, foco visível, teclado, Escape, aria-expanded/aria-current, alvos táteis, contraste e 1440/1280/768/390 claro/escuro.
- UI de matriz perfil × recurso × ação somente se contrato backend persistente e autorização de gestão estiverem comprovados. Caso contrário, tratar como BLOQUEIO DE BACKEND e não simular persistência.
- Troca de organização, logout, revogação e resposta RPC atrasada devem invalidar imediatamente links e capacidades.

## Fase C — segurança e testes
- Testes RED de master autorizado, não-master, Contabilidade com permissões concedidas/negadas, navegação CRUD, organização A/B, revogação, sem sessão, falha de RPC, navegação direta, teclado e contraste.
- GREEN somente após PLAN → dois required checks SUCCESS mesmo HEAD → merge → GATE separado → BUILD → Zero-Drift, Vitest, lint, typecheck, build, Teste C independente, evidências visuais e HML JWT real.
- Segurança backend: menor privilégio, RLS e grants efetivos, matriz de autorização por ação; não expor operações apenas por esconder links.
- Registrar provas individualizadas no checkpoint, preservar três ressalvas R01–R03 sem convertê-las em PASS.

## Allowlist proposta para BUILD futuro (não concedida por este arquivo)
`src/lib/navegacao/menuV1.ts`, `src/components/layout/ContaOSSidebar.tsx`, `src/components/layout/ContaOSAppShell.tsx`, `src/components/administracao/usuarios/AdminUsuarios.tsx`, testes correspondentes e arquivos de documentação de evidência. Rotas/serviços adicionais somente após inventário e emenda formal à allowlist do `PLANO_ATIVO.json`, com CI e merge anterior ao BUILD. Nenhuma edição de `src/integrations/supabase/types.ts`.

## Gate
**NO-GO para BUILD** até inventário integral, leitura normativa e contrato MASTER/RBAC backend verificados. A aprovação deste documento não implica aprovação de escopo, autorização real nem certificação V1. V2 permanece bloqueada.

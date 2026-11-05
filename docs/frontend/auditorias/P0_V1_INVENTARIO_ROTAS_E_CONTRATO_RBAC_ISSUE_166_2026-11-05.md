# P0 V1 — Inventário real de rotas e lacunas de autorização (issue #166)

**Data:** 05/11/2026. **Fase:** GATE de diagnóstico, sem autorização de BUILD. PLAN PR #167 integrado no commit `eb582f9dbe3974c0d0c51f8b0834ca381f092d92` após CI `42068018132`, Zero-Drift e Teste C SUCCESS no mesmo HEAD `6213a9e906b3da79acf63cb5fd7184ffd640beed`.

## Inventário confirmado por busca no código (`src/routes`)
- Entrada e autenticação: `/`, `/login`, `/esqueci-senha`, `/redefinir-senha`, `/selecionar-organizacao`.
- Contratantes: `/contratantes`, `/contratantes/novo` (arquivo `contratantes_.novo.tsx`), `/contratantes/$id/editar` (arquivo `contratantes_.$id.editar.tsx`). Confirmar no gerador TanStack os paths efetivos antes de codificar.
- Contratos: `/contratos`, `/contratos/novo`, `/contratos/$id`, e telas contextuais `/contratos/$id/{regras,orcamento,historico,documentos,competencias}`. Conferir paths literais nas declarações `createFileRoute`, porque nomes de arquivo usam notação TanStack.
- Competências: `/competencias/$id`, `/competencias/$id/analise`, `/competencias/$id/parecer` (paths dependem da declaração literal).
- Administração: `/administracao/usuarios`, `/administracao/auditoria`.
- Não foi encontrada, na busca atual, rota própria de **cadastro de organização**; `/selecionar-organizacao` é seletor, não CRUD. Registrar lacuna, sem criar rota fictícia.
- Resultado da busca por `createFileRoute`: 20 arquivos indexados. A busca pode ser limitada/paginada; verificar `routeTree.gen.ts` antes de declarar catálogo exaustivo.

## Falhas de apresentação verificadas
- `menuV1.ts`: 3 entradas gerais + 2 administrativas, sem subitens Novo Contratante, Novo Contrato e telas contextuais.
- `ContaOSAppShell.tsx`: `Mono_Branco_Transparente.svg` aplicado em tema claro e `Mono_Navy.svg` em escuro; símbolos igualmente invertidos. **Causa direta provável** de marca invisível na captura. Corrigir somente após gate visual BRAND-01 e teste.
- `ContaOSSidebar.tsx`: menu sem agrupamento, subitens, título da organização e acesso às operações CRUD existentes.
- `AdminUsuarios.tsx`: apresenta `perfis_disponiveis` em vínculo; não possui interface comprovada de matriz perfil × recurso × ação.

## Contrato MASTER/RBAC ainda não comprovado
- `validarAdministrador(organizacao)` autoriza Usuários e `podeConsultarAuditoria(organizacao)` autoriza Auditoria. **Não há prova de que MASTER global seja reconhecido por essas RPCs**. Não usar `user_metadata`, e-mail ou simples texto do papel como fonte de autoridade.
- Não existe prova de tabela/RPC para configuração persistente de permissões por papel e ação. Exigir inventário do HML e contrato do backend antes de desenhar UI que grave permissões.
- Se o backend não implementar a capacidade, a correção exige PLAN/GATE de backend separado e aprovação normativa, sem alteração direta em RLS, grants ou tipos certificados.

## Critérios de aceite a instrumentar
1. Master com sessão HML sintética e autorização comprovada vê e consegue acessar cada rota V1 existente, inclusive Novo Contratante e Novo Contrato, e administrar organizações **se houver contrato backend autorizado**.
2. Demais perfis têm menu baseado em capacidades efetivas, matriz de permissões persistida e negativas testadas no backend, não apenas menu oculto.
3. Testes de mudança de organização, revogação, navegação direta, ausência de sessão, erros de RPC e resultados assíncronos antigos.
4. Marca correta para claro/escuro e expandido/recolhido, sem sobreposição; WCAG 2.2 AA e quatro larguras.
5. PLAN → GATE → TDD RED → BUILD → GREEN → Teste C → auditoria visual → checkpoint, dois required checks no mesmo HEAD.

## Estado
**Diagnóstico de rotas: PARCIAL. Contrato MASTER: NÃO VERIFICADO. RBAC granular: NÃO VERIFICADO. BUILD: NO-GO.** V1 não certificada; V2 bloqueada. Este relatório não modifica código funcional, não altera PROD e não declara permissões inexistentes.

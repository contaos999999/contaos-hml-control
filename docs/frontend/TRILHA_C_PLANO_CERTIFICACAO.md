# Trilha C — Integração de telas e chat contextual — Plano e inventário inicial

Status: **INICIADA; NÃO CERTIFICADA**. Baseline frontend `ec59265dc375554828656b24ad82293f411cd464`; backend `ebda39d15e7f7bcb4170b091487b275b56670ac4`. Não alterar/invalidar certificações A/B. Evidências devem ser vinculadas a HEADs e deploy HML.

## Inventário comprovado por árvore GitHub

O diretório `src/routes` contém 29 arquivos TSX, dos quais 27 são rotas de domínio/aplicação (excluídos `__root.tsx` e README; conferir também `index`, login e recuperação). Áreas: contratantes, contratos, base normativa, orçamento, regras, documentos, histórico, competências, análise, parecer, apresentação, protocolo, administração, autenticação e seleção de organização. Shell compartilhado `src/components/layout/ContaOSAppShell.tsx`, sidebar `ContaOSSidebar.tsx` e cabeçalho `ContaOSOrganizationHeader.tsx`; TanStack Router em `src/router.tsx`. Testes existentes em `src/test` cobrem telas e shell; isso **não** comprova integração ponta a ponta. **Nenhuma rota ou componente de chat identificado no inventário superficial**; verificar busca de código e contratos de backend antes de implementar.

## Sequência obrigatória (P0)

1. **Inventário exaustivo**: gerar matriz de cada rota real, CTA, link, navegação, estado, organização/contrato/competência/documento, ação CRUD, papel RBAC e API/RPC/Edge consumida. Conferir routes geradas, sidebar, testes e HML autenticada. Cada item recebe ID e evidência; não presumir que telas existem só pelo nome do arquivo.
2. **Lacunas**: testar transições reais e deep links, refresh, back, erro, loading, seleção de organização, MASTER e perfis negados, navegação teclado/móvel; identificar órfãs, CTAs inertes, permissões e dados sem contexto. Comparar com PRD canônico V1–V5, distinguindo funcionalidade planejada de implementada.
3. **Validação do plano**: publicar matriz e contratos de chat (usuário/organização/contrato/competência, fontes, mensagens, threads, auditoria, retenção, anexos, permissões, rate limit, custo, IA, citações, ferramentas). Revisão independente de segurança e UX; não substituir regras canônicas silenciosamente. Mudanças necessárias via PR explícito com teste de compatibilidade.
4. **Implementação**: primeiro rotas/links e ações reais de navegação; depois chat contextual persistido em Supabase via API/RPC/Edge, JWT/RBAC/RLS tenant-isolado, fontes autorizadas e auditoria; integrar a shell sem duplicar logo/helper. Chat não pode executar CRUD ou aprovações por prompt livre sem validação backend e confirmação humana onde exigida.
5. **Testes**: unitários, contrato, SQL/RLS com usuários MASTER, comum e tenant B; navegador autenticado em todas as rotas, links e ações, conversa contextual com isolamento, erros e concorrência, teclado/contraste/responsividade; negar IDOR, prompt injection, dados cruzados, upload indevido, ações não autorizadas. Baselines A/B imutáveis; testes focais da alteração + regressão dos consumidores e gates Zero-Drift/Restore/public-probe. Provas documentais B preservadas, sem replay integral.
6. **Certificação**: mesmo HEAD no PR, CI, revisão independente, deploy HML com SHA conhecido, Teste C real com screenshots e hashes, SQL independente e cleanup. Registrar PASS/FAIL/BLOCKED por rota e cenário; nenhum skip equivale a PASS. Certificar C somente quando 100% da matriz mandatória estiver aprovada; V1 global separada.

## Critérios de não regressão

- Não editar `src/routeTree.gen.ts` manualmente; regeneração só pela ferramenta prevista.
- Não regenerar `types.ts` fora da política Zero-Drift.
- Não enfraquecer RLS/RBAC/JWT, regras de negócio, branch protection, migrações ou o worker v5 certificado.
- Alterações no frontend não podem modificar os artefatos backend aprovados sem nova análise de impacto e reteste focal.
- Sem credenciais, fixtures de produção ou dados reais em logs/artefatos; somente HML.
- Manter checkpoint com HEADs, PRs, jobs, SHA256, evidências, pendências e próxima ação; atualizar após cada lote.

## Estado desta entrega

Inventário inicial e plano escritos. Ainda faltam varredura funcional, matriz exaustiva, implementação de chat, integração, testes HML e certificação. **Não declarar Trilha C certificada.**

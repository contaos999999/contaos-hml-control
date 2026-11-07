# ADR — GitHub como fonte e executor canônico de desenvolvimento ContaOS 4.1

**Decisão mais recente do titular (07/11/2026). Substitui as decisões anteriores sobre editor frontend.**

## Arquitetura obrigatória e imutável salvo decisão expressa posterior
- **Frontend ContaOS:** React/TypeScript e componentes existentes; formulários, botões, confirmações, feedback, navegação, rotas e CRUD global permitido por regras de negócio. Código versionado e desenvolvido por PRs no GitHub, com GitHub Actions como executor dos testes, validações e automações. GitHub Actions não é um editor visual; alterações de código são propostas em branches/PRs e verificadas pelo Actions.
- **Supabase próprio HML `gklhhhyosgasnyoxlrui`:** API/Data API, RPCs e Edge Functions, autenticação, RBAC, RLS, autorização e validação de regras e transições. Nenhuma decisão privilegiada apenas no frontend.
- **PostgreSQL + Storage + Auditoria:** persistência, integridade, histórico, versionamento documental e evidências. Backend continua no repositório `contaos999999/develop`, com migrações HML rastreadas.
- **GitHub:** repositório frontend `contaos999999/contaos-hml-control`, branches, PRs, rulesets, CI, Teste C independente e checkpoints oficiais.
- **Lovable:** retirado do fluxo de edição, BUILD e execução. Não sincronizar alterações dele para a branch canônica nem criar backend paralelo.

## Controles não revogados
- V1 deve ser certificada antes de V2–V5; manter PRD 4.1, 100 prompts 00–99, 97 prompts atômicos 000–096, BRAND-01 e Zero-Drift.
- `src/integrations/supabase/types.ts` congelado no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`; LOCK-TYPES-01 com detecção, restauração controlada e CI.
- PR obrigatório, CI verde no SHA final, Teste C separado somente leitura, rastreabilidade, segurança e evidências reais. Não forçar merge, não ignorar gates, não tocar PROD.
- Não afirmar que runner ativo implica HML JWT, migrações ou certificação completa. A migration `20261107001620_p0_crud_listas_verificacao` e provas JWT exigem confirmação antes do CRUD de listas.
- Preservar HEADs, commits, PRs, testes, impedimentos e próxima tarefa no checkpoint oficial antes de trocar conversa.

## Evidência de retorno GitHub Actions
Run `42330398171` (LOCK-TYPES-01) foi reexecutado: job `protect-types` **success**; checkout e teste de hash concluíram **success**. Isso comprova que o runner executou esse job, não a saúde de todos os workflows. PR #252 ainda aberto e não integrado à main no momento desta decisão.

## Ordem de execução
1. Registrar esta decisão e aprovar seu PR com CI remoto verde.
2. Revalidar status e integrar PR #252 após todos os checks obrigatórios verdes; exigir proteção do check no ruleset.
3. Revisar checkpoint #250 e estado real de HEAD, PRs e HML; não retomar código a partir de cópia antiga.
4. Completar gates do frontend V1, CRUD global e padronização das telas/rotas/AppShell, sempre sobre o GitHub canônico.
5. Executar Teste C independente, certificar V1 com evidências e somente então avançar V2–V5.

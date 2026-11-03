# ADR-DEV-001 — Desenvolvimento direto do frontend pelo GitHub

**Estado:** APROVADA · **Data:** 03/11/2026 · **Solicitante:** responsável pelo ContaOS 4.1

## Decisão oficial

O desenvolvimento e as correções do frontend serão realizados **diretamente no repositório GitHub** `contaos9999/contaos-hml-control` (React + TypeScript), sem depender da IA de BUILD do Lovable. A preferência é trabalhar em branch de mudança, com PR e revisão quando tecnicamente disponível; o repositório deve sempre ser mantido em estado funcional e auditável.

**Supabase HML** `gklhhhyosgasnyoxlrui` segue como **única autoridade de dados e backend**. Código de migrations, RPC, RLS, grants, funções, Storage e Edge é governado em `contaos9999/develop`; não instalar backend paralelo nem alterar schema por conveniência. **PROD não deve ser alterada**.

O **Lovable permanece conectado como ambiente de sincronização, pré-visualização e consulta visual**, não como editor canônico ou fonte de verdade do frontend. Não usar o agente Lovable para implementar features ou correções regulares. A integração ainda pode regenerar `src/integrations/supabase/types.ts` por conta própria, razão pela qual o processo exige Zero-Drift e Auto-Lock.

## Processo de aprovação formal (ADR-DEV-002)

A execução direta por GitHub **não autoriza pular a etapa de validação do PLAN**. Antes de qualquer BUILD, seguir integralmente o rito [ADR-DEV-002](ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md): PROMPT → PLAN → VALIDAÇÃO FORMAL → commit documental + CI verde → BUILD frontend → CI → Teste C separado → dossiê e retomada. O backend permanece fora do escopo; mudança de `src/`, `public/` ou configuração do app somente com `PLANO_ATIVO.json` VALIDADO em commit anterior.

## Fluxo de trabalho obrigatório

1. Ler o estado mais recente de ambos os repositórios, o PRD 4.1, critérios do PROMPT 00–99 e atômicos 000–096 aplicáveis, decisões de produto, BRAND-01 e o tracker das 39 etapas.
2. Identificar uma falha ou lacuna **concreta**, formular PLAN mínimo com escopo e critério de aceite, sem mexer em outros arquivos.
3. Implementar frontend **diretamente no GitHub** ou ferramenta de edição conectada ao repo, produzindo commits pequenos; usar TDD RED/GREEN para mudanças funcionais. Backend somente quando houver tarefa própria e escopo definido.
4. Executar testes focados + regressão, lint, TypeScript, build, varredura de segredos e Zero-Drift; conferir o blob imutável `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` de `src/integrations/supabase/types.ts`.
5. Após BUILD, Teste C **independente e somente leitura**, usando SHA imutável do commit, validação visual em 1440/1280/768/390 × claro/escuro, estados e acessibilidade, além de ensaios em HML com autorização real quando aplicável.
6. Registrar commit SHA, CI, testes, evidência, lacunas e próximos passos no dossiê individual e matriz oficial. Não confundir MOCK com E2E nem testes de configuração com autorização efetiva.

## Conflitos e limitações

Esta decisão **substitui apenas** orientações operacionais antigas que exigiam Lovable como ferramenta de edição do frontend. O pacote PRD 4.1, arquitetura, Premissas, Zero-Drift, regras de aprovação e BRAND-01 permanecem vigentes.

O GitHub do frontend permanece conectado ao Lovable. Evitar `force push`, `rebase` de histórico publicado e mutações não controladas. A proteção obrigatória de branch não estava disponível no plano GitHub privado no último diagnóstico; o CI e o Auto-Lock são mitigações, não proteção de escrita pré-merge.

O arquivo protegido `types.ts` foi realmente regenerado pelo Lovable e depois **reparado em push automático pelo Auto-Lock**: https://github.com/contaos9999/contaos-hml-control/actions/runs/41725182728 e commit https://github.com/contaos9999/contaos-hml-control/commit/174512a2d2cc978f9c04da54bd8096ad2e47408d. Isso prova a recuperação, não a desativação do gerador interno.

**Protocolo permanente de continuidade de conversas:** [ESTADO_E_RETOMADA_CONTAOS_4_1.md](ESTADO_E_RETOMADA_CONTAOS_4_1.md). A cada sessão, primeiro confirmar os HEADs atuais, workflows e issues, nunca presumir que o snapshot anterior continua vigente.


## Exceção controlada para lacuna comprovada de backend

A autorização geral para desenvolver o frontend **NÃO autoriza migrar ao backend**. Se a implementação evidenciar uma possível lacuna no Supabase, documentar e **solicitar autorização humana para mudar o foco ao fluxo `contaos9999/develop` e investigar HML**. Após a autorização, investigação read-only, constatação objetiva, PROMPT/PLAN/validação separados, BUILD backend limitado somente se gate PASS, certificação, GitHub e retorno imediato ao frontend. O procedimento detalhado, inclusive aprovações adicionais obrigatórias, está na [ADR-DEV-002](ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md). Todas as demais tarefas permanecem somente frontend.

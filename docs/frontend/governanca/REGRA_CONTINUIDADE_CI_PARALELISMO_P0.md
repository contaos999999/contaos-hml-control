# P0 — Continuidade operacional enquanto o CI executa

## Regra obrigatória
Nenhum CI em andamento justifica interromper o desenvolvimento integral. Ao iniciar CI, registrar a dependência e avançar em paralelo sobre tarefas independentes e reversíveis, sem modificar a branch protegida ou alterar a fonte canônica. Reconsultar os resultados antes de qualquer merge, homologação ou certificação.

## Fila de execução
1. **Pronto:** tarefas independentes, documentação, revisão de contrato, testes RED, inspeção estática e preparação de implementação.
2. **Aguardando CI:** merges/etapas dependentes do mesmo HEAD, com PR, SHA, run ID e checks exigidos.
3. **Falha:** diagnosticar logs, corrigir em branch e reenfileirar novo CI; jamais suprimir gate.
4. **Concluído:** registrar resultados verificáveis e iniciar próxima etapa da mesma versão.

## Política de priorização
Prioridade zero: V1 completa e certificada antes de V2; depois V3, V4 e V5. Cobrir 100 prompts regulares e 97 atômicos. Sidebar/AppShell, BRAND-01, WCAG, segurança HML, Teste C, auditoria visual e evidências GitHub continuam bloqueadores transversais. Não declarar PASS operacional a partir de PASS documental. Não executar alterações de produção sem autorização específica.

## Autonomia e comunicação
A autorização do titular para PLAN/GATE/BUILD/testes/PRs e merges após checks permanece válida. Evitar perguntas repetidas e respostas exclusivamente de status. Comunicar resultados concretos e impedimentos reais, mantendo a fila ativa. A automação periódica é mecanismo de continuidade entre execuções; não afirmar execução ininterrupta fora de uma chamada efetiva.

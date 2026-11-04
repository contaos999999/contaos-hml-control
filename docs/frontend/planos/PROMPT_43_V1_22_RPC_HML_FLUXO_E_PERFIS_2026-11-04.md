# V1-22 — inspeção real de RPCs HML e decisão de teste

Data 04/11/2026. Titular autorizou testes controlados fictícios e limpeza; **nenhuma alteração de dados executada nesta inspeção**.

## Constatações verificadas via pg_get_functiondef
1. `public.confirmar_upload_arquivo` delega para `privado.confirmar_upload_arquivo`: exige auth.uid, vínculo organização/contrato, caminho `org/uploads/uuid/arquivo`, configuração MIME/extensão/tamanho, objeto real em `storage.objects` do bucket privado `contaos-documentos`, e registra `public.arquivos` e auditoria. Não comprova associação automática a histórico.
2. `public.enfileirar_processamento_documento` delega para `privado.enfileirar_processamento_documento`: exige `id` existente em `public.versoes_documento`, acesso ao contrato, perfil dentre `administrador`, `gestor_contrato`, `prestacao_contas`, `financeiro`, `contabilidade`, `rh_dp`, `juridico_conformidade`, `auditor`; cria job na fila `documents` e registro em `processamentos_documento`. **Não foi comprovado que o worker gere `relatorios_historicos_contratante` ou apontamentos.**
3. Policy INSERT `relatorios_historicos_contratante`: acesso ao contrato e perfil `administrador`, `gestor_contrato`, `prestacao_contas`, `auditor` ou `juridico_conformidade`; SELECT condicionado a acesso ao contrato. A definição de `gestão` no PRD precisa ser confrontada com esses perfis, sem ampliar autorização no frontend.
4. Trigger `trg_scope_contrato` na tabela de relatórios e apontamentos chama `privado.bloquear_mutacao_fora_escopo_contrato`; presença de trigger não equivale a teste de isolamento multiusuário.

## Gap de comprovação
Ainda falta contrato autorizado para lote histórico: upload -> arquivo -> registro histórico -> fila de ingestão histórica -> apontamentos/respostas/desfechos, incluindo estados e tratamento de falhas. A fila documental genérica **não é prova** de processamento histórico. É inseguro criar registros fictícios antes de definir vínculo e limpeza com preservação de auditoria. Não confundir autorização para testes com autorização para alterar schema/Edge/RLS.

## Próximo passo
Inspecionar worker e Edge pertinentes e mapear política de exclusão de dados fictícios. Preparar fixture isolada e teste de perfis com sessões autenticadas distintas; só executar mutações quando integridade e limpeza estiverem demonstradas. Caso contrato histórico não exista, registrar LACUNA DE BACKEND conforme manual e solicitar autorização de correção específica, sem contornar P0.

# PROMPT 43/V1-22 — implementação backend HML, evidências e pendências

Titular autorizou expressamente corrigir e testar o HML. Projeto Supabase `gklhhhyosgasnyoxlrui`. Nenhuma alteração em produção.

## Implementado no HML
1. Migração `v1_22_registro_historico_gestao_hml`: RPC `registrar_relatorio_historico_hml` valida autenticação, perfil de gestão, contrato, arquivo aprovado, competência, duplicidade e auditoria.
2. Migração `v1_22_fila_dedicada_ingestao_historica_hml`: fila pgmq `historico`; RPC `enfileirar_ingestao_historica_hml` exige arquivo/versão/contrato/organização coerentes, processamento documental concluído, perfil de gestão, idempotência; worker pull/finalize restritos a service_role.
3. Edge Function `queue-worker-historico` **ACTIVE v2**, SHA256 do bundle `1b9618a5ee8dfb8faa472242a9ea7c4b912e1cce10f05af30547986dd23f818d`. Autenticação via `validar_token_interno`, mesma convenção dos workers oficiais. Lê páginas processadas, extrai apenas itens explicitamente identificados por marcadores e preserva trecho/página. Evita repetir apontamentos já existentes; marca resultado do processamento. Não infere apontamentos ausentes, não gera regras automaticamente.
4. Migração `v1_22_agendamento_worker_historico_hml`: cron `contaos-worker-historico-v1-22`, jobid 9, ativo, frequência 1 minuto, token interno vindo do Vault.
5. Migração `v1_22_vinculo_resposta_desfecho_gestao_hml`: RPC `vincular_tratamento_historico_hml` exige autenticação, perfil de gestão e acesso ao contrato, cria resposta/desfecho ligados ao apontamento e registra auditoria.
6. Revisão humana: RPCs preexistentes `promover_precedente_para_regra` criam somente regra candidata e `aprovar_regra_preventiva` exige perfil de aprovação e registra revisão humana. Não foi necessário contornar esse gate.

## Testes efetivamente executados
Três testes SQL de rejeição sem sessão para registrar relatório, enfileirar e vincular tratamento: **PASSARAM**. Contagens pós-teste: 0 relatórios, 0 apontamentos, 0 respostas, 0 desfechos e 0 jobs históricos. Migrações retornaram success=true; Edge retornou ACTIVE; cron ativo confirmado.

## Não certificado
Não foi executado upload real com sessão de gestão nem teste de isolamento entre duas organizações; fila sem mensagem não demonstra consumo real. Não há ainda prova de CI frontend, Teste C ou integração UI. Extração por marcadores é conservadora e não atende todos os formatos de relatório; requer revisão humana e testes com documentos representativos. A versão 2 do worker é implantada, mas comportamento ponta a ponta ainda não está homologado. Status: **backend implementado parcialmente, validação integrada pendente**. Não declarar V1-22 concluído nem promover PROD.

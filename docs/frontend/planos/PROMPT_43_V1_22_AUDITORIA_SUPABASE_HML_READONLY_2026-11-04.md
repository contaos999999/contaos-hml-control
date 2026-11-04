# PROMPT 43 / V1-22 — auditoria Supabase HML somente leitura

Autorização expressa do titular nesta conversa. Data: 04/11/2026. Projeto HML: `gklhhhyosgasnyoxlrui`. Nenhuma mutação realizada.

## Evidência de catálogo real
- Projeto ACTIVE_HEALTHY.
- Storage: bucket `contaos-documentos` PRIVATE.
- Edge `storage-sign-upload` ACTIVE com `verify_jwt=true`; `process-document` ACTIVE com `verify_jwt=true`; workers `contaos-worker`, `queue-worker-documents`, `queue-worker-ocr` e `queue-worker-ai` ACTIVE (status de deploy, não prova de processamento real).
- RPCs existentes: `public.confirmar_upload_arquivo(p_id_organizacao,p_id_contrato,p_path,p_nome_original,p_mime,p_tamanho,p_sha256,p_origem)` e `public.enfileirar_processamento_documento(p_id_versao_documento,p_chave_idempotencia)`.
- Tabelas com RLS habilitada: `arquivos`, `versoes_documento`, `processamentos_documento`, `execucoes_assincronas`, `relatorios_historicos_contratante` e `apontamentos_historicos`.
- Policies de INSERT e SELECT foram identificadas para `arquivos`, `versoes_documento` e `relatorios_historicos_contratante`; somente SELECT para `processamentos_documento` e `execucoes_assincronas`. RLS habilitada **não comprova isolamento efetivo por usuário**.
- `relatorios_historicos_contratante` referencia `id_arquivo`, `id_contrato`, `id_organizacao`, `competencia_referencia`, `status_processamento`, mas **não foi demonstrado** um fluxo específico de ingestão em lote e vinculação ao processamento assíncrono.

## Resultado
**PARCIALMENTE COMPROVADO.** A infraestrutura documental genérica existe. Falta verificar definições/autorizações efetivas dos RPCs/Edges, política do bucket, associação entre relatório histórico e versão/processamento, autorização de gestão, fluxo de lote e integração real da Queue. Não concluir que V1-22 está pronto nem alterar o backend sem autorização específica de escrita. Plano e BUILD continuam sujeitos aos gates normativos.

## P0
Próximo 43/V1-22, depois 75/V1-23, sidebar transversal issue #66 após ambos, auditoria retrospectiva e certificação V1. PROD proibido.

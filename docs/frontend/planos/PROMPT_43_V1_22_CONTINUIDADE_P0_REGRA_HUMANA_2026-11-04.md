# V1-22 — continuidade P0 e contrato de aprovação humana

Data 04/11/2026. Ordem constitucional P0 permanece V1-22 → V1-23 → auditoria/certificação V1; não iniciar V2.

## Evidência Supabase HML
- Migração real `v1_22_registro_historico_gestao_hml` aplicada e teste de sessão ausente passou; ainda não é fluxo completo.
- Worker `queue-worker-documents` v4 extrai páginas/fragmentos mas não cria relatórios/apontamentos históricos.
- `privado.enfileirar_job` permite somente filas `documents`, `ocr`, `ai`, `embeddings`, `finance_imports`, `reports`, `integrations`, `webhooks`. Portanto não usar fila inédita `historico` sem migração explícita da infraestrutura. A fila `reports` precisa de roteamento por `entidade_tipo` para não confundir com geração normal de relatórios.
- `privado.promover_precedente_para_regra` cria regra com `situacao='candidata'`, sem ativação automática.
- `privado.aprovar_regra_preventiva` exige sessão e perfil humano autorizado, situação candidata, fonte adequada e grava `revisoes_regras_preventivas`, auditoria, aprovador e data; não recriar esse fluxo nem contornar suas condições.
- Para V1-22, ingestão deve gerar apontamentos com referência de origem, vincular resposta/desfecho, propor precedente e regra candidata; a ativação fica exclusivamente na RPC existente de aprovação humana.

## Pendência concreta
Implementar e implantar worker assíncrono específico e roteamento de fila autorizado; teste integrado real com sessão e arquivo fictício; integração frontend somente após PLAN/GATE. Não alegar certificação. HML apenas; PROD proibido.

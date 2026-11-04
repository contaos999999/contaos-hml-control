# PROMPT 43/V1-22 — migração executada no Supabase HML

Autorização expressa do titular para corrigir backend e testar em HML. Projeto `gklhhhyosgasnyoxlrui`. Migração `v1_22_registro_historico_gestao_hml`: **sucesso** via Supabase apply_migration.

## Alteração real
Criada RPC `public.registrar_relatorio_historico_hml(uuid,date,text)` SECURITY DEFINER com search_path vazio. Exige sessão, acesso ao contrato, perfil `administrador` ou `gestor_contrato`, arquivo com status `aprovado`, competência no primeiro dia do mês e tipo permitido. Usa advisory transaction lock por arquivo e retorna registro existente para evitar duplicidade. Insere `relatorios_historicos_contratante` com status `pendente`, sem alegar processamento automático, e registra auditoria. EXECUTE revogado de PUBLIC e anon, concedido a authenticated.

## Teste realizado
Bloco DO chamou RPC sem sessão e exigiu exceção `Sessão necessária.`; passou. Contagem de registros históricos após teste: **0**. Nenhum arquivo fictício ou usuário de teste criado.

## Pendências não mascaradas
Ainda não existe prova de processamento histórico assíncrono, geração de apontamentos/respostas/desfechos, regra preventiva com aprovação humana, nem teste real multiusuário. A RPC de registro é um passo de infraestrutura, não certifica o PROMPT 43. É necessário inspecionar políticas e desenvolver worker histórico com contrato próprio, Teste C e CI. Não promover produção.

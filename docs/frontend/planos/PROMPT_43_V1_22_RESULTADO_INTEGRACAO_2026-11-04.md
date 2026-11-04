# PROMPT 43 V1-22 — resultado de inspeção de integração HML

Autorização do titular para auditoria e testes com dados fictícios; nenhuma mutação HML efetuada até esta evidência.

- `process-document` Edge v3 (ACTIVE, verify_jwt true) valida JWT, recebe `id_versao_documento` e chama `public.enfileirar_processamento_documento`; resposta com `id_execucao`. **Somente fila genérica `documents`.**
- A RPC interna valida contrato e perfil e cria registro em `processamentos_documento`, mas não vincula o job a `relatorios_historicos_contratante`.
- Consulta ao catálogo `pg_proc.prosrc` em schemas `public` e `privado`, filtrando referências literais a `relatorios_historicos_contratante` ou `apontamentos_historicos`, retornou **zero funções**. Não prova inexistência de código de worker Edge que opere diretamente sobre essas tabelas, mas indica ausência de RPC SQL de ingestão histórica.
- Consulta ao bundle do worker `queue-worker-documents` foi inicialmente bem-sucedida parcialmente e depois falhou na ferramenta ao tentar nova leitura. A primeira leitura revelou rotina de validação e extração de arquivos, mas não confirmou criação de registros históricos.

**Gate atual: LACUNA DE BACKEND / INTEGRAÇÃO NÃO COMPROVADA.** Não forçar dados fictícios em tabelas históricas antes de demonstrar contrato e cleanup seguro; não confundir teste de fila genérica com aprovação V1-22. Próxima ação: auditar código de worker versionado, identificar eventual fluxo histórico ou planejar correção em backend HML com PLAN separado e testes; frontend BUILD 43 somente após contrato autorizado e gate.

# PROMPT 43/V1-22 — diagnóstico confirmado do worker HML

Em 04/11/2026, após autorização do titular, foi lido o bundle implantado da Edge Function `queue-worker-documents`, versão 4, Supabase HML `gklhhhyosgasnyoxlrui`.

## Constatação direta
O worker acessa as tabelas `versoes_documento`, `arquivos`, `configuracao_upload`, `processamentos_documento`, `paginas_documento` e `fragmentos_documento`. Não contém referências a `relatorios_historicos_contratante`, `apontamentos_historicos`, `respostas_historicas` ou `desfechos_historicos`. Faz validação de integridade e segurança, download do bucket privado, extração de texto, fragmentação e encaminhamento para OCR/embeddings. A Edge `process-document` só enfileira a versão documental. Não há RPC SQL com referência literal às tabelas históricas nos schemas `public`/`privado`.

**Diagnóstico:** lacuna funcional real na integração entre o pipeline genérico e a ingestão histórica do PROMPT 43. Não basta conectar a interface ao worker existente. Não marcar V1-22 como pronto.

## Implementação requerida, em sequência
1. PLAN/GATE backend: definir contrato de associação `id_arquivo` -> `relatorios_historicos_contratante`, competências, perfis de gestão, auditoria, idempotência e isolamento por organização/contrato.
2. Worker de ingestão histórica assíncrona autorizado, separado ou roteado explicitamente; origem em documento aprovado e processado; não alterar genericamente o worker documental sem teste de regressão.
3. Extrair apontamentos com referências verificáveis a página/trecho e revisão humana; vincular respostas e desfechos por apontamento. Nunca promover regra preventiva automaticamente; exigir aprovação humana e rastreabilidade.
4. Status persistente, falhas, reprocessamento idempotente, proteção contra duplicidade e restrição de perfis em backend/RLS.
5. Teste controlado HML: dois usuários de organizações diferentes, upload fictício, processamento real, prova de vínculo, acesso negado cruzado, auditoria e limpeza segura, preservando eventos imutáveis.
6. Atualizar tipos/frontend e executar PLAN 43 -> GATE -> BUILD -> Teste C -> CI -> merge com evidências.

## Restrições
Sem mutações de produção; não contornar PRD, Zero-Drift, nem gates. Nenhuma mutação de banco ou deploy foi executada nesta auditoria. Registro de evidência não equivale a implementação ou teste aprovado.

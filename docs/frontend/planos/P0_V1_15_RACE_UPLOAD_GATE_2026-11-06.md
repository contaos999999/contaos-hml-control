# GATE P0 V1-15 — readiness do input de upload

**Estado: GATE documental candidato, não certificado.** PLAN #189 integrado com checks SUCCESS no HEAD `ae75ed505f7b8cf6c20c0c8564c1e4544992785d`. Base `a0f8a66113bcc84f51949dfc9075ecc97223bea0`.

## Evidência
- Falha real run `42180357595`, 1/921 no caso `arquivo inválido usa validação V1-10 e não chama Edge`.
- Run posterior `42180790342` verde; hipótese de corrida ainda não comprovada por reprodução isolada.
- Input `Arquivo` desabilitado até configuração pronta; helper `selecionar` espera apenas presença do input.

## Gate de BUILD
1. Criar prova RED que retarde o carregamento da configuração e demonstre que o helper antigo seleciona arquivo antes de habilitação, sem suprimir erros.
2. Corrigir exclusivamente `src/test/competenciaDocumentos.test.tsx` para esperar `toBeEnabled()` antes do evento, mantendo assertivas de mensagem e nenhuma chamada Edge.
3. Executar teste isolado e suíte completa com Vitest dois workers, preferencialmente múltiplas execuções, registrar HEAD, job e contagem.
4. Teste C independente e Zero-Drift no mesmo HEAD; sem afrouxar regras de MIME, extensão, tamanho, permissões ou controles HML.
5. Se RED não reproduzir a hipótese, investigar outras causas antes de BUILD; nunca registrar como resolvido sem evidência.

## Saída
Dois checks obrigatórios SUCCESS no HEAD do GATE e BUILD; registrar resultados no checkpoint #166. Não certifica V1 nem SYS-03. PROD inalterada.

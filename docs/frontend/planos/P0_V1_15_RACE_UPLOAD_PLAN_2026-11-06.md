# PLAN P0 V1-15 — determinismo da seleção de arquivo

**Estado:** PLAN proposto, sem BUILD ou certificação. Base `bb1af20759a7f522f302c80a251cdc6690466495`.

## Evidência e diagnóstico
- Workflow pós-merge #187 `42180357595`: 920/921 testes passaram; falhou `src/test/competenciaDocumentos.test.tsx`, caso `arquivo inválido usa validação V1-10 e não chama Edge`. Não encontrou a mensagem `Este formato de arquivo não é aceito pelo ContaOS.`.
- Workflow pós-merge #188 `42180790342`: Zero-Drift e Teste C concluíram SUCCESS no mesmo HEAD `bb1af20759a7f522f302c80a251cdc6690466495`. Uma execução verde não invalida a falha anterior.
- O helper `selecionar` aguarda o input por rótulo, mas não espera `enabled`. O componente desabilita o input enquanto a configuração não é carregada, e `escolher` só valida se `config` estiver pronta. Hipótese: corrida de temporização sob Vitest 2 workers, ainda não reproduzida de forma isolada.

## Escopo BUILD permitido após PLAN e GATE
1. Em `src/test/competenciaDocumentos.test.tsx`, no helper `selecionar`, aguardar `waitFor(() => expect(input).toBeEnabled())` **antes** de `fireEvent.change`.
2. Não mudar `validarArquivo`, restrições de extensão/MIME, chamadas Edge, assertivas de formato inválido ou políticas de segurança.
3. Prova RED/GREEN: reproduzir o teste com configuração artificialmente retardada e verificar que o helper aguarda readiness, sem ocultar falhas de produto; registrar execução isolada e suíte completa com 2 workers.
4. Teste C independente; CI Zero-Drift; inspecionar os resultados no HEAD exato e registrar hashes/run IDs. Sem PROD.

## Gate e saída
- PLAN e GATE separados; dois checks obrigatórios SUCCESS no HEAD de cada PR antes do merge. Não declarar causa-raiz confirmada nem regressão definitivamente corrigida sem evidências RED/GREEN e suíte completa.
- Manter V1 NO-GO e V2 bloqueada até demais critérios de certificação, incluindo SYS-03 real.

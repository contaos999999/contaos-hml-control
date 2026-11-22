# F3 CODE — Driver V116 com confirmação pelo consumidor

Missão F3-138-CODE-CERTIFICATION. Implementar `f3S4RequestAnalysis` sobre o fluxo UI já existente em `src/components/competencias/CompetenciaAnalise.tsx`, e `assertF3S4AnalysisReadback` de resposta autoritativa da RPC `obter_analise_competencia_v116`. Sem alterar backend, modelo de dados, fixtures ou clientes frontend.

A ação só será permitida se o livro de intenções registrar a competência de V113 na organização isolada. O corpo `solicitar_analise_competencia` terá `p_id_competencia` dessa competência e `p_tipo=completa`, validado pela cerca CDP original. A confirmação requer resposta de mutação e nova leitura da mesma competência no consumidor, sem reaproveitar execução anterior; estado de análise pendente não constitui conclusão da análise.

Testes positivos e negativos em CODE verificarão bloqueio de UUID externo, readback cruzado, duplicidade, falha de status, resposta sem execução e repetição não autorizada. Não conectar automaticamente o driver a `runF3Session` antes de fechar os demais produtores e consumidores, porque `F3_COMPLETE` exige todo o catálogo. Nenhum teste isolado autoriza `F3 CODE = PASS`.

Arquivos: `scripts/hml/integracao-v1-fase3.mjs`, `scripts/hml/integracao-v1-fase3.test.mjs`, e este documento. Revisão independente e gates no HEAD obrigatório.

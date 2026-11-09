# GATE R15: recuperação R14 e retry único de timeout de metadados

Data2026-11-09. PLAN513 integrado em1282198bfc72ac4a119856139e6b95d9e14177dc, HEADf80a90a07d5ed74edcaa0e6654687f0058a9fa51, revisão5832530162/0Critical0Important e CI42696531055/42696530807 SUCCESS. Este GATE só autorizará o BUILD abaixo depois de CI, revisão e integração protegida deste documento. Não autoriza Auth, SQL, deploy, rerun, novo pedido ou alteração de proteção.

## Baseline e escopo

Main externa869ccbe830d89717ee2091c1b36044d414fa67bf integrou PR512/a9c0a771918cefaf8cc4d4d131197e762ad98c3d apesar de DRAFT/Important5832413282. Sua política3tentativas/12s/TRANSPORT/tokenfora não é aceita. O BUILD deve corrigi-la, sem reescrever histórico e sem ampliar este GATE.

Dois caminhos existentes somente: `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs`. Nenhuma mudança no preparador, YAML, SRC, tipos, dependências, transporte de negócio, listeners, cercas, segredos, ENV pública, settings ou cache defaults. Preservar UI507/merge8d43ae8f94b39d81b8125d087a1c9a968e2d8ad7, GATE508/83792d243982bda854d81d518dc41dbc5e54b90d, DocR13 canônico3108/SHA92bf8114d857b2061b0a2ce67cfb908f2dd1c71e1800b567bfecf52c17e12da9, orçamento10 confirmadas+1 reservada+13novas/teto24, semanticdenyOct/R11 e todos os históricos. Writer22dados+SHA23/HISTORY19, report/recovery/ledger atuais e arquivos históricos inalterados. Não fabricar Doc/report/receipts/logout R14.

## Prova R14 anterior a qualquer credencial

S original imutável6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36, upstream42694401246 SUCCESS/push/main/attempt1; Fixtures42694609672 FAILURE/workflow_run/main/attempt1; Audit42694609740 SUCCESS/workflow_run/main/attempt1. Verificar os três runs, os três attempts e os três conjuntos completos de jobs, mais artifacts de Fixtures vazio: dez GETs lógicos fixos, mesmos endpoints/limites do verificador existente. Não confundir timestamps de run com attempt: comparar cada campo por sua própria identidade e ordenação válida.

Fixtures: request129422980268 FAILURE, protocolo129422982805 SKIPPED/steps[], privado129423314958 SKIPPED/steps[]. Request steps exatos:1 Set up job SUCCESS;2 Bootstrap publico confiavel antes de checkout ou token SUCCESS;3 Run actions/checkout@v4 SUCCESS;4 Run actions/setup-node@v4 SUCCESS;5 Run node --test scripts/ci/install-pinned-bun.test.mjs SUCCESS;6 Run bun install --frozen-lockfile SUCCESS;7 Provar evento e unicidade somente em metadados Actions FAILURE;13 Post Run actions/setup-node@v4 SKIPPED;14 Post Run actions/checkout@v4 SUCCESS;15 Complete job SUCCESS. O diagnóstico original fechado foi REQUEST_API/RUN_JOBS/NONE/TIMEOUT→HARNESS_FAILURE20:37:12Z; não inventar causa de infraestrutura.

Upstream: quality129422257245 SUCCESS com steps1..11SUCCESS,12SKIPPED,13..22SUCCESS,43..45SUCCESS; TesteC129422258076 SUCCESS com1..3SUCCESS,4..12SKIPPED,24..25SUCCESS. Nomes exatos correspondem ao YAML original fixado e à matriz API original, sem exigir igualdade entre timestamps de objetos distintos.

Audit: request129422980473 SUCCESS, protocolo129422983606 SKIPPED e privado129423257559 SKIPPED. RequestAudit usa os mesmos nomes/números de steps do requestFixtures, com1..7SUCCESS,13SKIPPED,14..15SUCCESS; protocolo e privado steps[]. Upstream e oposto mantêm identidades, origem, repositório público/ownerIDs, SHA, branch, workflow e attempt1 fechados; exigir matriz dos jobs e steps reais do source original, sem aliases/campos extras ou ausência tratada como sucesso. Ausência de App Auth/novas intenções é derivada dos privados SKIPPED e fonte original, não de tamanho de artefato.

Recomputar quatro objetos Git originais em S: auditorcbfb86149e89fb48a39d6c6b769167720b4004d0; preparador79a7384eba8acd22a460c4bde11acb14100d2e07; FixturesYAML9af69f3ae0797cd4f0e9713950e473bc1b4a8f17; auditoriaYAML848acf35a51bb5b420d5cf9047972da4a75a98eb. Exigir S ancestral do pai aprovado, além PLAN1282198 e merge deste GATE e ancestrais já exigidos. Não usar o auditor externo869 como fonte histórica R14.

Cache técnico interno novo: exatamente estes nove campos ordenados, own-data, sem getter/proxy/símbolo/extra:
```json
{"schema":"contaos.single-request.r14-zero-auth.v1","headSha":"6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36","upstreamRun":42694401246,"fixturesRun":42694609672,"auditRun":42694609740,"privateJob":129423314958,"attempt":1,"derivedNewBusinessIntents":0,"proof":"GITHUB_ACTIONS_LIVE_METADATA"}
```
Validar/resetar contexto e todos os caches antes do primeiro guard ENV, em controller e loader, sem reaproveitar estado quente após falha. Controller fixtures preflight e revalidação presecret executam prova; operação oposta continua saindo antes da API. Loader valida literal/identidade/ancestry/frescor existente30s antes do contexto Master, com zeroGET/token de metadados no Master. Preservar cache R12 de nove campos e seus guards; não adicionar reportfield/ENV/DocR14. Nonce nova `trilha-a-fixtures-20261109-r15`; R14 `trilha-a-fixtures-20261109-r14` consumido, jamais rerun. Nenhuma solicitação nova antes do BUILD corrigido e aprovado.

## Correção do transporte: tentativa engloba fetch e body

Apenas `singleRequestGet`, GET de metadados GitHub. Máximo duas tentativas físicas por chamada lógica, isto é, um único retry. Mesmo método/host/URL exata, redirect:error, status200 obrigatório, limite4MiB e validação fechada existentes. Cada tentativa cria um sinal próprio com timeout≤min(5000,deadlineRestante), revalida ENV/token e reconstrói headers antes de qualquer fetch. O MESMO sinal dessa tentativa governa fetch e leitura do body e permanece acessível para classificar ambos. Retry somente se falha de fetch OU body for TIMEOUT tipado pelo sinal dessa tentativa. Não ler name/message/stack arbitrários nem invocar getter de erro. Dados parciais são descartados; nenhuma validação ou resultado parcial vira cache.

Deadline compartilhado60s original, nunca reiniciado por retry/novo GET da prova. Rechecar orçamento antes de cada tentativa, depois de awaits e antes de aceitar resultado. Se deadline esgotado, falhar fechado sem segundo fetch. Dez GETs lógicos de prova admitem no máximo20 físicos apenas quando cada repetição decorre de TIMEOUT; não há extensão por chamada ou prova.

Zero retry para TRANSPORT genérico, HTTP401/403/404/429/5xx, body TRANSPORT, tamanho, JSON inválido, schema, identidade, ENV ou token mutado. JSON/schema/identidade não podem ser envolvidos num catch que habilite retry. Token/ENV inválidos na segunda tentativa devem bloquear antes do segundo fetch, sem imprimir valor ou erro bruto. Sem fallback público, backoff, novo endpoint/host, retry de workflow, nonce, App Auth, POST/RPC ou operação de negócio.

Bug concreto512: `signal` foi declarado dentro do for, mas o catch de `response.text()` usa `signal.aborted` fora do escopo; body rejeitado pode lançar ReferenceError e perder diagnóstico. Eliminar esse gap no consumidor real. Preservar enums endpointKind/status/transportCategory fechados e sanitizados e guardas de5s/60s; não aceitar12s mesmo que testes antigos o esperem.

## RED→GREEN e critérios de conclusão

Testar `singleRequestGet` real, sem espelhar implementação: fetchTIMEOUT uma vez→mesmaURL na segunda→sucesso; doisTIMEOUT→falha; bodyTIMEOUT→único retry bem-sucedido ou esgotamento fechado; bodyTRANSPORT→sem retry/semReferenceError; HTTP/JSON/schema/tamanho/identidade/ENV→zero repetição; errocanário não publicado; token/ENV alterado entre tentativas→zero segundo fetch; deadline compartilhado e físico≤2/prova≤20 sem extensão; tempo por tentativa≤5s; prova R14 dez endpoints/origens/matrizes/artefacts0/quatroGitpins/ancestry; cache literal9hostil/fresh30/resetantesENV/zeroGETMaster. Não relaxar fixtures legadas para aceitar3/12/TRANSPORT.

RED causal primeiro em CI, depois fix mínimo, GREEN/lint/fmt e CIs aplicáveis no HEAD final. Preservar dezoito nativos reais, sourceforms5/base8 e probe público real0024/8FQ sob guards existentes, sem atribuir sessão HML ao ensaio offline. Revisão independente e integração protegida antes do pedido R15 separado JSON7campos/CI/revisão canônica/merge normal/freeze. Sem rerun R14; leitor somente após R15 terminal com artefato real e pins novos. Este GATE não autoriza Auth ou consulta de negócio.

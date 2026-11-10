# GATE: navegação real e recuperação R5 para fixtures R6

PLAN453 HEAD6ca0ee7b0d782b47e9cd9c0cf3b675b1466de06a, revisão5822767668, CI42579794103/42579793915. PLAN integrado por merge protegido3e23a7b1077a9364942d81f000ffd4db4b885b8f; CI ambosSUCCESS e readback confirmou somente o PLAN nos parents3fb/6ca. A autorização contínua do titular dispensa nova confirmação de execução, mantendo revisão/CI/proteções técnicas.

## Base e invariantes

Base do ensaio real R5: merge3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d. Produto HML437c788e32f0325dd15c9d2e7277c10129bcb462/deploymentdpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp; harness e produto são distintos por projeto. Fonte normativa5459536e7f7121e2f26758841acd520f84e0ad9d, conferir viva antes de integrar/executar. TrilhaC13, tipos congelados, catálogo109/SYS04/V112/V123 histórico, bootstrap451 e todas as cercas permanecem íntegros.

Únicos quatro arquivos de código permitidos:
1. scripts/hml/prepare-visual-fixtures.mjs
2. scripts/hml/prepare-visual-fixtures.test.mjs
3. scripts/hml/authenticated-visual-audit.mjs
4. scripts/hml/authenticated-visual-audit.test.mjs

Sem mudanças em workflows, SRC/public, Supabase, SQL/RPC/RLS, dependências/lock, tipos, campos/colunas/paginação de transporte, timeouts, navegação por goto/evaluate ou AuthAdmin/service_role. Nenhum ajuste de cobrança/plano/segurança do provedor. Nenhuma liberação de audit.

## Prova R5 fechada e orçamento

Run42578223154/attempt1/workflow411426169/job129030891867/head3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d; request R5nonce trilha-a-fixtures-20261109-r5, PR452reviewcanônica5822632902, pai77f3de9c07f374f4b665b9171e3bca3f0e93e71b e requestHEADb0c37d1989458accdcdb6863a35900989db9bc23. Artifact13656530451/ZIP6363B SHA2565380c9c1a5b18e75e7a0e09e41902c826eae0a9cb1f9589f7f34a819f463985b. Root e revisão independente confirmaram seis arquivos do manifesto; fonte dos membros é o artefato real, não inferência por log.

| Membro | SHA256 |
|---|---|
|report.json|c631d266351fa609600dbcdbe60f1d1a54d8fac76e740c10d80017277a6f55ba|
|receipts.json|fd97a387cae0e16af65c6923f453ac83262e58447176c3c558b1c10bc15c5eeb|
|receipts-r1.json|381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9|
|recovery-r2.json|d4772f47294aefa08d3683c79156414d9f5984053ea2ffe0cd8360c082527d45|
|receipts-r3.json|28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364|
|recovery-r3.json|db27ca1ab4a4ba6da14dab4c2879670e420c969fde183f0fd6730c654c197f4f|

O report histórico é PREPARER_INCOMPLETE/FINAL_READBACK/completed=false/logoutVerified=true/cleanupFailure=null. Ledger count8/priorConfirmed3/newArmed5/frozen=false/pending=false/sent=false/maxIntentions24/maxNew21, sem reescrita. Receipts contêm exatamente cinco pares sealed/confirmed, identidade coerente e nenhum pending/uncertain/denied/stale. Os cinco IDs e payload hashes são os literais do PLAN453; comparar todos, sem aceitar apenas contagem. Org/contrato/run/head/frontend/deployment e schema/chaves exatos, requestIDs únicos/disjuntos R1/R3; relações sealed→confirmed mesmo RPC/contexto/payload.

O novo documento de recuperação R5 deve conter a origem e bytes técnicos minimizados necessários, validados pelas hashes do report e receipts originais. JSON canônico UTF8 JSON.stringify(2)+newline deve reproduzir ambos antes de uso. Negar substituição por estrutura parecida, extra fields, getter/proxy, hash aprendido, relatório parcial marcado completed ou mistura de origens. O uso de bindings parciais limita-se à reconciliação dos objetos existentes; não equivale a fixture final nem autorização de audit.

Somar3 históricos R1/R3+5 R5=8confirmados e limitar16novos no mesmo teto24. Preservar arquivo/bytes históricos maxNew21. Broker deve carregar o total real desde a origem e contar intenções realmente armadas, sem ajustar contagem no report por constante. Proibir replay das oito confirmações por requestId, payload equivalente ou caminho alternativo; fonte/versão/aprovação/ativação e comandos de criação/publicação dessa lista e criação das duas competências não são necessários novamente. Negar equivalência semântica mesmo com UUID/hash novo: criar_lista com nome/contexto fixture, salvar_item da lista/versão/código/fonte R5, publicar_versao da lista/versão R5, criar_competencia do contrato nos dois meses R5. Não proibir o RPC inteiro para operações distintas; vínculo documental/análise/parecer/aprovação/apresentação seguem as barreiras existentes.

## Reconciliação antes de qualquer nova intenção

Usar somente as leituras ordinárias e navegação já permitidas. Sem chamadas paralelas, fetch injetado, nova SQL/RPC/query, invalidation arbitrária, reload ou criação substituta.

Contexto fixo org e87f7e68-c5ae-4077-943b-02a4afd8b6ee, contrato be89ef7e-d839-46c0-9cfb-4da81edf8b74 e contratante041ebf9f-5e32-4744-80d6-d745fa5fc483:
- Fonte8b942e46-a29b-40d9-8ad4-04aaf9124a34 ativa, versão1ebbfd0b-c50c-405d-8806-321f18e179e0 e sourceHashd8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1.
- Lista bf71906b-87a4-42f5-8371-5f597ef2ad9b, versãoe49ef6dd-13b0-491d-8646-5a7bcd5298cf e iteme7065876-a620-4dbb-9b4e-992fa4fead83. Validar nome/descrição/ligações/regras oficiais existentes, versão ativa e requisitoAUD-A-TXT-001. Reutilizar, não republicar/recriar.
- Outubro50c26274-a36f-48e0-b2fe-5a1caf5d6a49 e setembro79bdc139-ed10-4c91-905e-b32b9a824d27. Exigir mês→ID→org→contrato únicos e estado atual oficialmente observado. Não escolher outro por ordem/nome.
- Documento contratual525e54fc-feec-4dc0-b540-1510a3c52485/arquivo8cc6ac08-7f5b-469c-ab50-7b33d5a12379 TXT285B/sha773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103, status aprovado, cadeia real.
- Nov histórico59072760-4420-4598-82dd-367f41a79e89 intocado; V114/V115/V116/V118 continuam vinculados a ele.

Qualquer objeto ausente, duplicado, divergente, vínculo downstream desconhecido, permissão negada ou intenção incerta bloqueia, sem compensação nem novo request automático. As leituras atuais já aprovadas podem retomar o progresso normal; report/receipt nunca substituem revalidação atual.

## Navegação real e cache

O fonte menuV1 blob3e8efae411ac992f0acbe81f81904eec8154b350, Sidebar a242507812400995631167e98250c255e0b340ea e CompetenciaVisaoGeral2344e5315859045c797cec1ad79a4c30d2e4adc3 prova ramo competencia sem link direto a documentos do contrato. Repro offline usou funções reais menuContextualV1 e link do harness: direto falha PREPARER_SPA_LINK/0cliques; dois hops passam. Não é execução HML nem substitui RED/CI/Chromium.

Em approvedContractFile, navegar primeiro por anchor visível para resumo /contratos/{contrato}, confirmar contexto/URL e depois anchor Documentos do contrato para /contratos/{contrato}/documentos. Sempre usar o link helper atual, exigir cardinalidade exata, fence e settlement existentes. Capturar ordinal antes do request da tela documentos, não depois; manter postconditions e parentesco seguros.

Fonte cache: router3423d598036579e62f42faec438f868b4bb0bb17 usa QueryClient sem defaultOptions; DocumentosContrato6c4eda6b2b9d52beb19694c4910db3a9079c3559 e documentosDados339d2bac3d757a4317b3eba401151d3a9b912d0d não fixam staleTime/refetchOnMount nos dados de lista/resumos; só configuração upload tem5min. Key de resumos inclui user/org/contrato/paresdocumento:versão. Não presumir que consulta de BaseNormativa compartilhe key.

A correção aprovada NÃO remove observed(versoes_documento/arquivos, ordinal) por hipótese. Testar montagem/desmontagem/volta com QueryClient/SDK reais e respostas sintéticas de contratos já aprovados, sem io.read inventado. Exigir que remount emita os requests ordinários antes de declarar o caso coberto. Se teste demonstrar cache legítimo sem novoGET e a cadeia não puder ser provada nas regras existentes, bloquear e propor emenda específica ANTES de reduzir freshness. Este GATE não autoriza fallback de cadeia imutável, force refetch ou observação nova.

## Diagnóstico causal mínimo

No catch existente por competência, chamar o capture(error) getter-safe do objeto activePreparationDiagnostics existente antes de resumir a competência parcial. A primeira causa observada em nested COMPETENCIES/COMPETENCY_UI deve ficar no report existente, com enum/classe/subphasePath limitados. PREPARER_INCOMPLETE posterior não a sobrescreve. Sem novo campo de recibo, sem raw message/stack/cause/URL/DOM/headers/payload; proxies/getters/canários não são invocados/exportados. Code parcial COMPETENCE_DEPENDENCY_BLOCKED continua genérico, nunca demonstra backend139.

Preservar continuação controlada dos dois meses/partial e validação de cardinalidade2; não introduzir abort/break novo que apague bindings. Manter logout/cleanup em finally e falha de limpeza separada da causa primária.

## Nonce e gates de execução

Futuro request fixtures literal trilha-a-fixtures-20261109-r6. R1–R5 consumidos; manter R4zeroAuth com provaActionsoriginal e sem inventar receipt0. Manter uniqueness/paginação/attempt1/originalrun/ancestry/reviewcanônica e schema_version1/se sete chaves. AUTO_DISCOVER vazio/vazio, sem redeploy porque código de harness mudou. Auditoria continua AUDIT_BINDING_PENDING.

BUILD não executa HML. Depois de CODE/GREEN/revisão/merge, criar PR distinto de um único JSON com pai main realmente aprovado, CI2 no HEADR e reviewcanônica exata. Conferir parentsP/R do mergeS, congelar main/deployment até término original. Auth somente no step final autorizado e secrets existentes, nunca por ferramentaSQL, browseralternativo, ambienteauxiliar ou dispatcher que contorne a solicitação.

## RED→BUILD→GREEN e DoD desta correção

1. Commit RED apenas testes nos arquivos permitidos; executar CI real antes de implementar código. Falhas devem provar navegação direta impossível, perda de primeira causa e ledger atual ignorando R5; não aceitar import quebrado/typo como RED.
2. Implementar mínimo dos quatro módulos; sem mudanças nas políticas ou páginas do produto.
3. Provar positivos e negativos: menu real/2hops/contextowrong/anchorabsent, cache/remount real, firstcause+getter/proxycanários,5pares/hashes/contexto/tamper/IDsdisjuntos,8+16/teto24/deny replay, lista/competênciasreusadas exatas, nonceR1–R5denied/R6valid/auditblocked.
4. Testes completos protocolos e helper451; manter8nativos+1visual+2sourceforms+2SYS04+1V112+1V123 intactos e sourceOrdering/OPTIONSdrain. CI real Chromium no mesmoHEAD, sem confundir15SKIPNodecomexecuçõesnativas.
5. Zero-Drift/build/regressão/TS/lintfocal/Brand/checksecrets/LOCK/TesteC aplicável e revisão independente no HEAD final. Revalidar fonte viva antes merge, preservar tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19.
6. OriginalR6 terminal: download seguro/manifest/PNGDOM quando aplicável/SHA256/recibos/bindings/logout e revisão independente. Partial permanece partial, sem nova prova inventada.
7. Este GATE não encerra24fixtures nem184pendentes, não altera72 por contagem e não certificaV1. Após fixturesfinalizadas, GATEpós-fixtures e BUILDdoauditor separados; então208protegidos e ledger184/232/72 reconciliados. Preservar18públicos/Run124nas origens, sem repetir tarefas aprovadas.

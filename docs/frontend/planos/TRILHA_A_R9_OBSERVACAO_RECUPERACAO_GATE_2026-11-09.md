# GATE R9: observação fechada e recuperação sem replay

Incorpora PLAN #471, HEAD bbc61faca3541dd674836044d1e76e9a73d77d03, blob e8bb8da864052d1c46e4e55fed10e5bad72cf9fe, CI e revisão vinculadas e merge comprovados no registro abaixo. Autorização contínua expressa do titular/P0; documento não executa Auth, SQL ou mutações.

## Provas e preservação

PLAN integrado em78409927e346c44b9760515e4e3fc2d0aeefbba2, parents9e6ab95f067c22c3b95fccd99bdf7444c6d9c461/bbc61faca3541dd674836044d1e76e9a73d77d03 verificados. CI42616643053Zero e42616643091LOCK SUCCESS; reviews5825788240/5825796800 noHEADbbc61,0Critical/Important.
Base e HEAD backend/HML revalidados antes deste GATE: frontend 78409927e346c44b9760515e4e3fc2d0aeefbba2, backend5eca44aebead3183e81b5c1af0d1dffa5fb8feb6; HMLREADY437c788e32f0325dd15c9d2e7277c10129bcb462/dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp. Snapshot/context_source_commit5eca permanece sem alteração. Preservar source_proof histórico, C13,25normativas/catalog100/97/tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19, helpers455/462 e isolamento468. Não atribuir produto437 ao novo main C13.

R8run42611391440, artefato13670961904, inspeção42613222286/job129146627132SUCCESS, logouttrue/cleanupnull. ZIP698e58fe9184b194cc1866b4c119d4df45ba23ccc5704665469a99793cce2fa9. DocumentoR8canônico blob022c8a7da23f5ce27b5333a1bed0cd2a0fcaf2f3/6973ASCII/SHA256b22c0e464915cd58f8d9918a2c4751078dbf73578528e833afd92fa646502884. Report3309/e913478993f895726f9e207c975533ee4a6fd3d9dac8dd0a319919fcf06c67cb e receipts2562/20af329dd9c441e4ede575fa6cb94a65c3d136ad777613170045c696328fad25 exatos. Primeira falha observada não comprova causa raiz. R8real OBSERVATION_FAILED não demonstra aborto/backend/limite. Precisão editorial do PLAN: requestId não permite inferir/comprovar chave idempotente ou UUID de execução ausentes dos recibos.

## Escopo exato

BUILD somente scripts/hml/authenticated-visual-audit.mjs, scripts/hml/authenticated-visual-audit.test.mjs, scripts/hml/prepare-visual-fixtures.mjs e scripts/hml/prepare-visual-fixtures.test.mjs. Sem workflow/dependências/lock/produto/transporte/rotas/SQL. GATE atualiza somente este documento, PLANO_ATIVO e ESTADO, mantendo todos campos históricos e acrescentando estado R9/allowlist documental. Reancoragem documental futura apenas se HEAD backend realmente mudar e comparativo provar limites.

## Contrato do diagnóstico

Arquivo separado observation-diagnostic.json, JSON canônico pretty2+LF, exatamente seis próprias chaves de dados na ordem schema,frontendSha,harnessSha,deploymentId,workflowRun,firstFailure. schema literal contaos.fixture.observation.v1; identidade igual ao contexto validado da execução. firstFailure:null ou objeto quatro chaves na ordem contractKind,stage,statusHTTP,requestFailure. Arquivo sempre emitido; null não certifica sucesso. Rejeitar extras, símbolos, accessors, Proxy, protótipos inesperados, identidade/enum inválidos antes de qualquer emissão. Nunca publicar raw Error/message/stack, URLs, payloads, respostas, statusText, headers, tokens ou PII.

contractKind literal TABLE:<nome> para os18 nomes atuais OBSERVED_TABLES, RPC:<nome> para os20 nomes atuais OBSERVED_RPCS; nenhum acréscimo, regex livre ou nome externo. UNKNOWN exclusivamente UNAVAILABLE. Stage matriz:
|stage|contractKind|statusHTTP|requestFailure|
|---|---|---|---|
|REQUEST_BINDING|RPC autorizado|NONE|NONE|
|REQUEST_ARGS|RPC autorizado|NONE|NONE|
|HTTP_STATUS|TABLE/RPC autorizado|inteiro100..599 fora200..299|NONE|
|BODY_READ|TABLE/RPC autorizado|inteiro200..299 realmente recebido|NONE/ABORTED/OTHER/UNAVAILABLE|
|RESPONSE_PROJECTION|TABLE/RPC autorizado|NONE|NONE|
|RESPONSE_CONTEXT|TABLE/RPC autorizado|NONE|NONE|
|OBSERVATION_LIMIT|TABLE/RPC autorizado|NONE|NONE|
|UNAVAILABLE|UNKNOWN|NONE|UNAVAILABLE|

Falha de classificação/status inválido ou indisponível→linhaUNAVAILABLE. Não inferir status ou confiar em message/code de erro externo. No catch BODY_READ, consultar request.failure() somente do requestPlaywright já admitido: retorno null→NONE; errorText string integral net::ERR_ABORTED→ABORTED; outra string→OTHER; consulta/estrutura inacessível ou inválida→UNAVAILABLE. Converter imediatamente para primitivos; não reter texto ou Error/request/response no documento/estado de diagnóstico. Essa consulta não muda o resultado fatal e não amplia listeners/fence/network. Não adicionar requestfailedlistener.

Guardar primeira falha normalizada imutável antes do throw/cleanup. Nunca sobrescrever/limpar em sucesso posterior,late event,flush,close ou logout. Flush continua OBSERVATION_FAILED fatal; ABORTED jamais passa/ignora erro. writer pode usar snapshot seguro antes de close ou projeção sobrevivente a close; isolamento entre execuções obrigatório. Sem novo retry/refetch/reload/invalidação de cache ou mudança de polling aprovado. report15/diagnostics9/recovery10 intactos.

## Recuperação R8 e teto

Validar originais/canonicalização/sha/pares sealed-confirmed/contexto e não duplicação de requestIds. Novo broker deriva10confirmadas/maxNew14/teto24; preservar histórico R8prior8/maxNew16, R5prior3/maxNew21. Novo documento e análise outubro não podem ser repetidos mesmo com UUIDs ou requestIds novos. Manter negações oito anteriores.

Oct competência50c26274-a36f-48e0-b2fe-5a1caf5d6a49/requisito75938450-a972-410c-8612-da3ef7dc0e00/doc c7f56ac9-81d6-45a4-81f8-db1383006c41/arquivo8cc6ac08-7f5b-469c-ab50-7b33d5a12379: reconsultar UI/leituras oficiais existentes e exigir relação exata, estado ativo/arquivo aprovado/hash antes de prosseguir. Ausente/divergente/duplicado bloqueia sem criação. Análise outubro já solicitada: obter UUID/estado reais via obter_analise_competencia_v116; queued/processing podem seguir polling existente até complete; not_analyzed/stale/failed/contexto divergente bloqueiam sem solicitar novamente. Solicitação confirmada não prova análise completa. Reutilizar fonte/lista/competências existentes, preservar novembro histórico, não criar novos dados por ausência de id em relatório parcial.

## Arquivos de evidência e leitor posterior

Manifesto exatamente14dados: receipts.json,report.json,receipts-r1.json,recovery-r2.json,receipts-r3.json,recovery-r3.json,receipts-r5.json,recovery-r5.json,receipts-r6.json,recovery-r6.json,recovery-r7.json,receipts-r8.json,recovery-r8.json,observation-diagnostic.json; maisSHA256SUMS=15membros. Históricos11. Preservar bytes e ordem/hashes originais, permitir hashes iguais legítimos com nomes únicos. Workflow atual já recolhe diretório inteiro.

Somente após terminalR9 real, PR separado de leitor pode alterar scripts/hml/inspect-fixture-artifact.mjs e .test.mjs, próprio .github/workflows/contaos-trilha-a-fixture-inspection.yml somente se layout exigir. Retarget IDs reais e validar novo schema/matriz/proveniência/recovery antes da única emissão técnica. Preservar downloaderoficial/digest obrigatório, warningsfatais, readonlyGitHub, limites/prazos/directoryfd/NOFOLLOW e ausência de AuthHML/escrita. Nenhum artefato falso, PNG/DOM público ou prova parcial.

## RED, GREEN, revisão e solicitação

RED causal primeiro em PR separado BUILDdraft, apenas testes: realbroker10/14+replays2negados; consumidores reais Octdocumentausente/analysisnot_analyzed→zeroarm/command; realobserver503vsbodyreject e writer14dados/15membros/firstFailure sobreviventeclose. Não usar import quebrado ou fixture inventada como RED. Negativos schemas/identity/payload/context/Proxy/getters/canários, latererrors/isolation, status()throw e enums/combinations inválidos. Positivos reais GET-only de entidades existentes.

BUILD→GREEN no mesmo HEAD: Node/Chromiumprotocols,15nativos preservados, lint/Prettier, Zero-Drift/LOCK, TesteC e revisão independente0Critical/Important, normalmergeprotegido. CIverde de docs não comprova runtime/HML.

Depois solicitação JSON7campos exatos, nonce trilha-a-fixtures-20261109-r9, approved_parent_sha=P real integrado. R1–R8spent, AUDIT_BINDING_PENDING preservado. Review canônico último emR, CI2, lease backend/frontend/HML e merge normalS(P,R) comdiffsomenteJSON. Freeze main/deployment até upstream/ambossubscribersoriginais attempt1terminais; semcancel/rerun/dispatch. Credenciais existentes somente stepMaster após metadados; tokenGitHub sómetadata. Finalização/logout normais. Atualizar checkpoint evidenciado.

Preservar18públicos/204PNG revisadas sem regressão comprovada. Os184 originais/24fixtures/208privados/72critérios continuam separados; nenhum PASS/V1certificação por contagem de recibos/CI. HML somente, sem PROD/AuthAdmin/service_role/SQL/RLS/schema ou enfraquecimento de segurança.

# GATE: inspeção somente leitura do artefato R6 no CI

PLAN457 HEAD444eb94e6ed2058af35dab66bded4296fe2a5059/blob4a5789f08d1cb6ce5b02d281bce04a5d7933abda integrado3ea5614ad4482781c1365a785b0aabdfdadbe079, CI42588020432/42588020429SUCCESS, review5823498628zeroC/I; readback confirmou apenasPLAN/parents9cd+444. Este GATE incorpora integralmente esse PLAN, inclusive tabela dos seis hashes históricos, formatos canônicos, quinze chaves report/onze receipt e proibições.

## Alvo imutável e UNKNOWN

Único alvo: contaos999999/contaos-hml-control/repo1442722734, run42585173702/workflow411426169/eventworkflow_run/main/attempt1/HEAD9cd01a472146c67c4a3cae5f3d9a6b5d7448716a/completedfailure; privatejob129053499534, requestjob129053161135success, protocoljob129053162669skipped. Upstream42585029040/workflow406076025/push/main/attempt1/mesmoHEAD/success. Artifactúnico13658434738/nome trilha-a-fixtures-42585173702-1/8366B/expiredfalse/SHA25610e55ed5856aac2879188ab5f2df3b1f4a98b180de21dd7abcb470c162f9d68c, nove arquivos.

Produto437c788e32f0325dd15c9d2e7277c10129bcb462/deploymentHMLdpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp/contexto org e87f7e68-c5ae-4077-943b-02a4afd8b6ee/contrato be89ef7e-d839-46c0-9cfb-4da81edf8b74. Últimas oito confirmações comprovadas pertencem R1/R3/R5. R6novasintenções/contagem/logout/bindings/causa continuam UNKNOWN; não assumir saldo16 livre nem negóciozero. NenhumaAuthR7/replay/compensação/SQL/audit antes da reconciliação real. Artefato não lido por este documento.

## Allowlist e autorização automática somenteGitHubread

Somente três novos arquivos de código:
- .github/workflows/contaos-trilha-a-fixture-inspection.yml
- scripts/hml/inspect-fixture-artifact.mjs
- scripts/hml/inspect-fixture-artifact.test.mjs

PLANO mantém todos os valores/paths prévios e acrescenta exatamente esses três. ESTADO preserva integralmente seu conteúdo anterior como sufixo. Sem alterar quatro mjs455, workflows Auth/Fixtures/Zero, SRC/public, tipos, deps/lock, Supabase, deployment, secrets ou cobrança.

Workflow pull_request(paths3) executa testes Node24 somente, permissions contents:read, semenvironment/secrets/tokenactions. O job de inspeção roda automaticamente apenas push emmain(paths3), depois de CI/revisão/mergeprotegido. Permissions apenas contents:read/actions:read; token efêmeroGitHub somenteparaGETsGHe downloader. Sempull_request_target/workflow_run/dispatch/inputarbitrário/write/OIDC/Master/servicerole. Concurrencyprópria cancel-in-progressfalse, timeoutjob5min. Inspeção read-only de um artefato imutável não é rerunR6 nem novoAuth; correção futura do leitor exige novoHEAD/CI/review, sem repetir negócio.

No job PR de testes, pode-se reutilizar o bootstrap Bun1.4.4 já aprovado (scripts/ci/install-pinned-bun.mjs Gitblob3491e78880b5d239b853aebc2e812f4bd3d6f492, conferir antesexec) e bun install --frozen-lockfile somente para ESLint/Prettier existentes. Não adicionar/atualizar package/lock/dependências. Os testes continuam node --test em Node24; inspector de main permanece Nodebuiltins sem appdeps/Bun. Executar ESLint dos dois mjs novos e Prettier --check dos três paths. Isto esclarece tooling de qualidade, não concede token/actions/secrets ao jobPR.

## Downloader oficial executado com saída privada capturada

Checkout separado actions/download-artifact commit d3f86a106a0bac45b974a628896c90dbdf5c8093, dist/index.js Gitblob374211f852b2a8155a0211c72e85dacc81bb69f3. Confirmar toolHEAD/diffquiet e hashGitblob exato antesexec. README/src e BUNDLEEXATO4.797.011chars foram conferidos: core.info emite literalmente SHA256 digest of downloaded artifact is <hex>; digestMismatch gera core.warning e SUCCESS. Logo SUCCESS sozinho é insuficiente.

Nosso CLI usa process.execPath Node24 para executar esse dist, semshell/npx/install/customZIPparser. Entrada fixa:
INPUT_ARTIFACT-IDS=13658434738, INPUT_RUN-ID=42585173702, INPUT_REPOSITORY=contaos999999/contaos-hml-control, INPUT_GITHUB-TOKEN=tokenGitHub, INPUT_MERGE-MULTIPLE=true, INPUT_PATH=diretórionovo0700 sob RUNNER_TEMPcanônico. INPUT_NAME/PATTERNvazios; nenhum input escolhe outro artefato. Childenv mínimo, GITHUB_API_URL/server constantes oficiais se necessários; semHOME/NODE_OPTIONS/NODE_PATH/DEBUG/proxy/TLSoverride/GITHUB_OUTPUT/credenciaisaplicação/runtimeAuth/OIDC. Não reenviar token a outro host em código próprio.

stdout/stderr do subprocesso ficam capturados, nunca reemitidos ou gravados em arquivo. Exigir exit0, exatamente uma linha de digest calculado igual ao SHA256 literalR6; rejeitar commandcorewarning/coreerror, digestwarning/mismatch, SHA ausente/duplicado/divergente, timeout/overflow. Warnings Node de depreciação podem existir no stderr privado, não constituem evidência e não são publicados. Buffer total máximo1MiB, SIGKILL no timeout. Deadline único30s cobre metadados+child+leitura/validação; checar também após fases síncronas e antes de stdout, sem retry. Ausência/mudança de formato bloqueia. Provar bootstrap/parseNode24 do bundle fixado sem chamadas HML; compatibilidade de download real será comprovada na inspeção main, não fingida por mock.

## Metadados e arquivos

Antes do download, GETs exclusivamente URLs GitHub fixas para run/artifact/lista/attemptjobs/upstream necessários; status200, respostaJSON bounded256KiB e deadline compartilhado, semredirect/retry. Validar todos campos relevantes do alvo/origem/owner/repo/HEAD/branch/event/workflow/path/attempt/jobs/nome/tamanho/digest/notexpired/unicidade. Não navegar URLs arbitrárias vindas do JSON. ErroHTTP/rate/schema/ambiguidade bloqueia sem dump.

Exatamente oito arquivos de dados mais SHA256SUMS. Ordem literal das oito linhas do manifesto:
receipts.json, report.json, receipts-r1.json, recovery-r2.json, receipts-r3.json, recovery-r3.json, receipts-r5.json, recovery-r5.json.
SHA256SUMS máximo4096B, cada dado máximo65536B, total máximo262144B; nenhuma pasta/extra/PNG/DOM/symlink/hardlink/arquivo não regular. Usar rootnovo/canônico, lstat/openNOFOLLOW/fstat para verificar identidade e leitura limitada sem TOCTOU de caminho; não ler conteúdo antes da checagem de tamanho. Não publicar nomes desconhecidos. Recalcular oito SHA256 e exigir manifestoexato/único, além dos seis hashes históricos literais do PLAN. recovery-r5 original10588B/a92027cc0a7c9e2ce97f233c7aa1920205a158282ba6b955f7279cd9d8ae2dae foi reconstruído do documento literal no produtor72f9fe7852e2d8b9f2d9ce6451890956545680ad; SHA puro também reproduziu reportR5c631/receiptsR5fd97.

Sem importar preparer/auditor no leitor (topo requer TS/JSDOM/parse5). Validar com Nodebuiltins e enums/schemas fechados derivados do produtor R6 pinado; não introduzir regra de negócio. Qualquer divergência do formato esperado falha fechado.

## JSON técnico consentido e nenhum output parcial

UTF8fatal, semBOM; report somenteJSON.stringify(parsed,null,2)+newline. Receipts vazios somente forma compacta JSON.stringify(obj)+newline; não-vazios somentepretty. Rejeitar duplicatekeys/campos sobrescritos/whitespace/trailer fora desses bytes canônicos. JSONparseerror.message nunca publicado.

Report15chavesexatas: schema,failure,diagnostics,intentLedger,recovery,bindings,frontendSha,harnessSha,deploymentId,workflowRun,phase,completed,logoutVerified,ids,v1Certified. Diagnostics9chavesprodutor e enums/subphasePathfechados; ledger8chaves ou null, recovery fechado, bindings fechado ou null; UUIDs operacionais consentidos por role, hasheshex, bools/inteiroslimitados, estado/fase/falha de enums literaisprodutor. V1certified=false. Validar identidade/topology/contexto e relações; nunca regexglobal de datas/UUID/palavras para publicar conteúdo.

Receipts envelope schema/receipts, rows com exatamente11campos que o broker realmente emite: frontendSha,harnessSha,deploymentId,workflowRun,schema,rpc,requestId,state,organization,contract,payloadSha256. ids opcional do safeReceipt genérico NÃO aparece no brokerR6 e não é admitido por conveniência. Validar todos tipos, RPCs/estadosfechados, origem, IDs/hash e disjunção das oito confirmações anteriores; não confundir sealed com confirmed nem ausência comzero. Nulls/partial/uncertain permanecem explicitamenteunknown e impedem nova execução atéreconciliação.

Somente depois de TODOS checks, emitir uma única estrutura identificada FIXTURE_INSPECTION_PROOF, com origem da inspeção/run/head, digest verificado, manifesto/hashes e reportRaw/receiptsRaw UTF8originais. Estrutura serializada máximo65536B, sem truncar/recortar. Toda string a publicar precisa caber no schema técnico: qualquer PII/token/texto livre/campoextra/enumunknown rejeita a prova inteira. Nada de PNG/DOM/HAR/Authresponse/headers/cookies/storage/payloadnegócio/URL/env/childlogs/stack/mensagem bruta. Em falha stdout vazio, stderr somente enum de inspeção fechado, exit1; nenhum output parcial antes de erro tardio.

## RED→BUILD→GREEN e execução

1. Primeiro commit workflowunit scaffold+testes (sem inspectoroperacional), PRdraft/nodeREDcausal de comportamento ausente; não usar import/syntaxerror como prova. Jobinspector sempreSKIPPEDemPR.
2. Implementar somente3paths. Testes positivos locais do formato original e negativos de metadata/tool/digest/timeout/overflow/membros/symlink/hardlink/UTF8/BOM/canonical/duplicatekeys/hash/schema/roles/getterProxy/canárioemchildlogs ou errors. Injeções de teste não podem abrir URL/artefato/env/inputCLI em produção.
3. Testar ledgernull/receiptsvazio/partial/uncertain sem inventar contador; provar zero output em falha tardia e zero leitura de campos desconhecidos. Checagens crypto usam Nodecrypto, sem substituir por digest da API.
4. CIunit, Zero-Drift/LOCK/build/TS/testes/lintformato aplicáveis e revisão independente no HEADfinal; source5459536e7f7121e2f26758841acd520f84e0ad9d vivo antesintegração, tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19 preservados.
5. Merge protegido autoriza somente a leituraCI automática descrita. Root e revisor leem outputreal/logs/hashes; só então definem causa/saldo/bindingsR6 e próximoGATE/BUILD/request se necessário.
6. Falha do leitor não autoriza publicarraw desconhecido, rerunAuth, compensação, SQL, liberaçãoaudit ouV1. 184casos/24fixtures/72semfechamento,18públicos/Run124/C13preservados nas origens.

# Fase 2 R5: revisão canônica byte-exata e sucessor sem replay

## Estado e causa comprovada

Autorização expressa do titular permanece vigente para concluir e certificar a Fase 2 sem contornar controles. Este PLAN é documental e não executa Auth, fixtures, deploy ou produto.

O BUILD R4 foi integrado em `e9074971fe6fdffa31157babaf44cbc6adf86ac9`. O REQUEST R4 foi integrado pela PR #614 no merge `f5533cd11c4cefe9577857e419d8ea57a099712d`, com pais exatos `e9074971fe6fdffa31157babaf44cbc6adf86ac9` e `9e1cf2557435ccd8bc6c213c785b3c091be69063`, diff exclusivo do JSON e checks/revisão rastreados.

Runs originais R4: Fixtures `43289702393` attempt 1 SUCCESS, preflight `131432360566` SUCCESS e preparador `131432578426` SKIPPED; Autenticada `43289702129` attempt 1 FAILURE, preflight `131432360921` FAILURE `REQUEST_REVIEW` e privado `131432715186` SKIPPED. Não houve environment HML, credencial sintética, sessão, navegador privado, artefato ou logout. A nonce R4 está consumida e não admite rerun, replay ou nova interpretação.

A causa é única e reproduzida por leitura do produtor: `validateSingleRequestPull` aceita somente a revisão COMMENTED mais recente do titular, ancorada ao HEAD do PR e com corpo exatamente igual ao JSON serializado `contaos.single-request.review.v1`. A revisão `5880632205` estava ancorada ao HEAD correto e sem achados, porém usou prosa; por isso falhou a comparação byte a byte. Não é falha de produto, HML, credenciais, RLS, backend ou schema do request.

## Escopo fechado

PLAN: este arquivo, `PLANO_ATIVO.json`, prefixo aditivo do checkpoint mestre e ledger R4 zero-Auth. BUILD posterior: somente `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs`, alterando exclusivamente a nonce ativa audit para `integracao-v1-fase2-nav-20261112-r5` e acrescentando R4 à lista histórica consumida.

REQUEST R5 posterior: somente `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json`, sete chaves, pai igual ao merge BUILD R5, em PR isolada. A revisão do REQUEST deve ter corpo byte-exato calculado com o HEAD real do PR:

```json
{"schema":"contaos.single-request.review.v1","request_id":"integracao-v1-fase2-nav-20261112-r5","head_sha":"<HEAD_REAL_DO_PR>","critical":0,"important":0,"decision":"APROVAVEL"}
```

Proibido mudar `src/**`, `public/**`, marca, rotas, tipos, dependências/lock, YAML/workflows, backend, SQL, RLS, RPC, Auth, Storage, Edge, deployment, environment, segredo ou PROD. Tipos `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` imutáveis. R1/R2/R3/R4 consumidas. Produto HML `024a232c5bdb717e556d9ff16ca000e1ae65b0cb` e deployment `dpl_FZgy7ARPgbQAbnGVVtbegFi4htXW` permanecem inalterados.

## Sequência e gates

1. Integrar este PLAN por PR protegida após CI e revisão, com readback.
2. RED: demonstrar que R4 é recusada no modo ativo e que R5 ainda não é aceita; preservar reconhecimento histórico de R4. Demonstrar o corpo canônico R5 exato e negativas para prosa, espaços/chaves/HEAD/decision/contadores divergentes.
3. GREEN mínimo: substituir somente a nonce ativa R4 por R5 e incluir R4 entre as nonces históricas. Nenhum relaxamento de `validateSingleRequestPull`, review, CI, merge, unicidade, ancestralidade ou preflight.
4. Rodar suíte completa auditor/preparador, 18 nativas originais + NAV8, formato, lint, diff, LOCK, produto/typecheck/build/routeTree/Zero-Drift e quatro workflows do HEAD BUILD. Revisão final sem Critical/Important; merge protegido e push checks.
5. Abrir REQUEST R5 isolada sobre o pai BUILD exato. Registrar primeiro a revisão COMMENT canônica byte-exata acima no HEAD real; confirmar por readback a igualdade literal e checks obrigatórios antes do merge commit de dois pais.
6. Congelar main/deployment até AUTH/FIXTURES originais attempt 1 terminais. Sem rerun/dispatch/cancel/replay. Se preflight falhar, R5 também será consumida e exigirá sucessor.
7. Somente com execução privada real: registrar metadata antes de baixar artefato oficial; conferir digest/ZIP/CRC/membros/manifest/schema/proveniência/nativas, 52/52 PASS, logout true e zero HTTP/transport/page errors. Revisão independente e certificado somente após prova integral e PR final integrada/readback.

## Aceitação, segurança e rollback

Aceite técnico do BUILD: R5 ativa, R1–R4 recusadas como atuais e aceitas apenas no parser histórico; todos os testes e controles anteriores verdes, sem mudança de comportamento da auditoria NAV R4. Aceite final continua 52/52 PASS, logout e zero erros. Falha real de navegação exige novo PLAN causal, não adaptação para PASS.

Rollback somente por nova PR que reverta os dois literais do BUILD, nunca reativando nonce consumida. Teste C visual é N/A para esta mudança de protocolo; evidências visuais/produto anteriores permanecem. ZERO-DRIFT e economia Lovable conformes: GitHub direto, nenhum turno Lovable, sem fonte visual alterada.

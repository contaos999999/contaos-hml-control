# Trilha A P0: GATE separado da solicitação única HML

## Base e decisão
PLAN #380 integrado em c3f07bf64af728cfeac48bfb0dffae5d90a7c8b6, após Zero-Drift 42534367851 e LOCK-TYPES 42534367836 SUCCESS e revisão independente 6728553281 sem Critical/Important. Este GATE é exclusivamente documental. Não implementa disparo, não cria solicitação e não executa login ou fixture.

O titular já autorizou a resolução automática dos 184 casos. Não renovar autorização, pedir login ou mover secrets. Manter PLAN → CI → GATE → RED → BUILD → GREEN → Teste C → checkpoint, revisão independente e proteção da main. V1 permanece não certificada, issue #317 aberta.

O HML live foi observado READY; o novo preview do PR380 apresentou quota/402. Não afirmar que a quota foi resolvida nem confundir falha de preview com prova de indisponibilidade do deployment live. Identidade live precisa de nova conferência antes da solicitação.

## Contrato fechado e fases
Preservar workflow_dispatch na main. Adicionar workflow_run completed de ContaOS Frontend Zero-Drift, branches [main], aos workflows de auditoria e preparação, somente após integração deste GATE e BUILD revisado.

Fixar no código do BUILD exatamente:
- operation fixtures: request_id trilha-a-fixtures-20261108-r1.
- operation audit: request_id trilha-a-audit-20261108-r1.

Cada workflow aceita somente seu próprio par. O workflow da operação oposta termina sem job privado e sem credentials; sua execução técnica não consome o nonce da operação selecionada. Nonce não é credencial, mas autorização delimitada de execução única. Falha, cancelamento, resultado parcial, mutação incerta ou rerun não autoriza nova execução desse nonce. Nova tentativa requer novo PLAN/GATE, nonce e PR de solicitação revisados, dentro da autorização operacional existente.

Somente depois do BUILD integrado criar PR documental separado, contendo exclusivamente docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json. Não incluir código, evidência ou checkpoint nesse PR de disparo. Não criar o JSON durante GATE/BUILD. Para nova operação substituir o JSON em outro PR separado; não reutilizar nonce.

## Solicitação e integração
JSON UTF-8, até 4096 bytes, objeto sem chaves duplicadas ou extras, sem coerção, com exatamente schema_version, issue, operation, request_id, approved_parent_sha, frontend_sha, deployment_id:
- schema_version: inteiro 1; issue: inteiro 317.
- operation e request_id: um dos pares literais acima.
- approved_parent_sha e frontend_sha: strings de 40 hexadecimais minúsculos.
- deployment_id: string dpl_ seguida de 8 a 80 caracteres alfanuméricos.

Rejeitar JSON inválido, arrays, campos nulos, tipos incorretos e arquivo ausente, symlink ou fora do caminho fixo. Usar parser que detecte chaves duplicadas, sem executar conteúdo ou interpolar valores em shell.

A solicitação deve ser integrada por merge commit de PR protegido com exatamente dois pais; o primeiro pai P deve coincidir com approved_parent_sha e conter BUILD, GATE e pré-requisitos revisados já integrados. Exigir que o diff entre P e o commit integrado S altere exclusivamente o JSON permitido, sem renames, modos especiais ou outros caminhos. A existência de PR de solicitação integrado, base main, revisão e checks obrigatórios deve ser verificável pelos controles de proteção e metadados. Se main avançar durante a revisão, atualizar approved_parent_sha e repetir checks/revisão; não aceitar pai anterior por aproximação. Não aceitar squash, rebase, push direto ou commit de branch de PR como solicitação válida.

## Preflight sem secrets
Job separado sem environment hml, permissions contents:read e actions:read. Token somente no passo de consulta de metadados, persist-credentials:false; não repassar ao build, browser, preparador ou auditor e não imprimir token, headers ou resposta bruta. Jobs privados permanecem contents:read. Não usar secrets como condição ou consulta de estado.

Exigir simultaneamente:
1. Evento workflow_run completed completo, upstream event push, repository e head_repository contaos999999/contaos-hml-control, head_branch main, workflow ID 406076025, path .github/workflows/contaos-frontend-zero-drift.yml, nome exato, conclusion success e run_attempt 1.
2. Run corrente pertencente ao workflow executor esperado, event workflow_run, run_attempt 1. Buscar metadados do upstream por ID e do próprio run por GITHUB_RUN_ID e confrontar com o payload; rejeitar IDs ausentes, divergentes, forjados ou resposta parcial.
3. S = upstream head_sha = HEAD main vivo = checkout imutável do executor = SHA integrado da solicitação. Nunca assumir que github.sha significa o upstream SHA. Checkout explicitamente em S, fetch-depth:0, sem credenciais persistidas; verificar git rev-parse HEAD e os pais/diff reais. frontend_sha identifica separadamente a fonte implantada e deve existir e ser ancestral aprovado da main.
4. JSON e par operation/request_id válidos, pré-requisitos da operação comprovados e nonce aprovado por este GATE incorporado no BUILD.
5. Unicidade provada no histórico Actions e ausência de execução privada anterior para esse nonce/S. Usar endpoints GET de run, workflow e listagem de runs dos dois IDs executores exatos, sem descobrir workflow por nome aproximado. Conferir associação ID/path/repositório. Listar todas as páginas necessárias, per_page 100, no máximo 10 páginas por listagem, com status de todas as conclusões e tentativas; não filtrar somente success. Conferir total_count e paginação. total_count > 1000, inconsistência, resultado truncado, erro/403/404/429, timeout ou impossibilidade de prova bloqueiam.
6. No workflow selecionado, o conjunto completo correspondente à identidade S/upstream/request_id deve conter exatamente o próprio run corrente, tentativa 1. Qualquer outro run elegível, inclusive queued, in_progress, failure ou cancelled, bloqueia. No workflow oposto, permitir somente a execução técnica comprovadamente descartada pelo par de operação antes do job privado; não tratá-la como duplicata da operação selecionada. Ambiguidade sobre descarte ou associação bloqueia. Não inferir unicidade só de nome, ordem temporal ou resultado de uma página.

Implementar a consulta com limites de tempo explícitos, sem retry que execute negócio. Dados do evento/JSON nunca são comandos. Saídas para job privado são apenas identidades validadas, sem texto remoto livre.

## Serialização e barreira final
Preservar concurrency compartilhada trilha-a-authenticated-hml, cancel-in-progress:false nos jobs privados de ambos os workflows. A consulta inicial não reserva execução: repetir prova de unicidade e HEAD main vivo dentro da seção serializada, imediatamente antes do passo de login. Se a espera na fila tornou S obsoleto, bloquear sem secrets. Repetir comparação de deployment/fonte e pré-requisitos antes do login. Não cancelar execução ativa para favorecer pedido novo.

O descarte por operação ocorre antes de solicitar environment hml. Nenhum passo executado com credentials de negócio pode anteceder todas as barreiras. environment hml e seu par CONTAOS_HML_SYNTHETIC_EMAIL/PASSWORD permanecem exclusivamente no passo de login existente. Não fornecer token Actions a subprocessos de build ou navegador.

## Pré-requisitos por operação
Fixtures: PR373 corrigido, CI e revisão independente aprovados e merge verificado; workflow/preparador existentes conferidos após integração. Proveniência, identidade HML, barreira nativa e política de mutação limitada do preparador intactas. Não repetir mutação de resultado incerto. Este GATE não cria novas chamadas de negócio.

Audit: BUILD de privacidade aplicável integrado e revisado, preparação real comprovada por recibo imutável, vinculação efetiva das fixtures e identidade implantada aprovadas antes da solicitação audit. Não basta execução verde do preparador ou IDs inventados. Auditor permanece somente leitura; manter 24 casos dependentes de fixture separados, 18 provas públicas e baseline privado já aprovado. Não ampliar allowlists, ocultar conteúdo ou converter bloqueio em PASS.

Preservar dependências congeladas, Chromium sandbox, oito provas causais nativas no mesmo HEAD, SSR e paridade 110 módulos, checkout de fonte separado, CSP/TLS/fence/proxy/privacidade, logout finally e artefatos SHA256. Mudança de deployment aborta. Nenhum segredo no build, browser env, logs, DOM, imagens ou artefatos.

## Allowlist BUILD e RED
Somente os seis arquivos, a partir da main que contenha PR373 integrado:
- .github/workflows/contaos-trilha-a-authenticated.yml
- .github/workflows/contaos-trilha-a-fixtures.yml
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs
- scripts/hml/prepare-visual-fixtures.mjs
- scripts/hml/prepare-visual-fixtures.test.mjs

Ajustes restritos ao reconhecimento e validação do novo disparo e seus testes. No auditor atual, conferir as três barreiras workflow_dispatch, linhas 2218, 2279 e 2773 do baseline e6e852dd; números são âncoras históricas, localizar funções no HEAD integrado. Não liberar workflow_run genericamente nem relaxar native guard, preparação ou audit. O workflow fixtures ainda não existia no HEAD revisado do PLAN; confirmar sua criação legítima por PR373 antes de BUILD.

RED comprova ausência do novo disparo no baseline e rejeições por PR/fork/branch/repositório, upstream ID/path/nome/evento/conclusão/tentativa incorretos, run corrente estranho/tentativa 2, S obsoleto, checkout divergente, primeiro pai divergente, merge inválido, diff com código/outro arquivo, JSON extra/duplicado/tipo inválido, operation/nonce trocados, pré-requisito ausente, listagem indisponível/truncada, página 11 necessária, duplicata em páginas posteriores e duplicata queued/cancelled. Testar descarte do workflow oposto e revalidação depois da fila. Todos falham antes do passo de credenciais.

GREEN: positivos limitados, todos os negativos, oito casos nativos e suplemento visual isolado no mesmo HEAD, lint/formato focal, regressão aplicável, Zero-Drift e LOCK-TYPES SUCCESS e revisão independente sem Critical/Important. Não modificar Zero-Drift, tipos, package/npm/lock, src/public, Supabase, backend, Auth, ambientes, secrets, PROD ou políticas de segurança.

## Teste C e continuidade
Após merge BUILD e pré-requisitos, PR de solicitação separado como definido acima. Acompanhar execução sem editar executor durante auditoria. Registrar upstream/run IDs e tentativas, request_id, S/P, SHA executor/fonte, deployment, resultado das barreiras, logout, artefatos e SHA256; não incluir segredo ou payload Auth. Falha bloqueia continuidade automática; classificar causa e tratar por PLAN específico, sem rerun do nonce consumido.

Revisão independente das imagens e 72 critérios continua obrigatória. Teste unitário, CI ou execução de preparo não conclui 184 casos nem WCAG/232 casos. Atualizar matriz e checkpoint com provas reais e integração verificada. Rollback por PR restrito aos seis arquivos e documentação necessária, sem remover dados ou histórico. Não afirmar certificação V1 ou quota Vercel resolvida.

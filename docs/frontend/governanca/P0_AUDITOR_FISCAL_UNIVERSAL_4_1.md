# P0-ABS-001/002 — Fiscal universal de missões ContaOS 4.1

**Situação:** implementação em PR #690, sem ativação privilegiada. **Fonte de autoridade:** PLAN P0-AUD-UNIVERSAL-001 integrado pela PR #689 e emenda P0-ABS da PR #691, consultados exclusivamente na base protegida. A existência deste documento, de arquivos e de CI verde não constitui certificação de instalação, ativação da fila ou liberação da PR #679.

## 1. Finalidade e segregação

O auditor já existente, versão 3.1.4 (`auditar-pr.ps1`, `auditor-runner.py`, perfil `auditor`), permanece o único perfil de auditoria. O módulo `mission-supervisor.py` é mecanismo interno auxiliar de diagnóstico, não agente adicional, não aprova PR, não publica status e não executa merge.

O titular concede decisões específicas. O implementador altera apenas a branch autorizada. O auditor emite parecer técnico separado. A conta revisora elegível, diferente da autora, registra decisão formal na forma do protocolo. GitHub aplica proteções de branch. Nenhum componente deste BUILD habilita `ContaOS P0-ABS Mission Lock` como check obrigatório, cria GitHub App, segredo, conta revisora ou permissão.

## 2. Contrato e estados

Contrato proposto em `docs/frontend/governanca/MISSAO_ATIVA_4_1.json`, com `mission_id`, repositório, PR-alvo #679, sub-PR autorizada #690, last-proven/next task, requisitos, estado, origem do PLAN, e `activation_authorized: false`. A versão integrada na `main` protegida é a autoridade. É proibido aceitar versão modificada no candidato.

- `ACTIVE`: missão não certificada; bloqueio não transforma tarefa em DONE.
- `BLOCKED_EXTERNAL`: dependência verificável sem prova ou meio de execução, com causa e ação subsequente registradas.
- `CANCELLED_BY_OWNER`: somente decisão identificável do titular; não vira CERTIFIED.
- `CERTIFIED`: exige provas técnicas e administrativas em duas etapas, incluindo relatório independente, revisão formal aplicável, merge protegido, readback na main e checkpoint integrado. Texto autodeclarado não é prova.
- `NO-GO` de ativação: independente do estado operacional da missão. Pode coexistir com `ACTIVE` e com BUILD de código desativado.

Contrato não contém o próprio blob SHA (autorreferência impossível). Em vez disso vincula o blob protegido do PLAN #689. Um executor confiável deverá ler por SHA explícito o blob Git da própria versão integrada do contrato e atestar essa origem antes de utilizar o resultado. O supervisor que recebe JSON arbitrário é **somente diagnóstico**; não pode servir como publicador confiável por autoclassificar sua origem. O watchdog observa main/PRs/checks por API autenticada somente leitura e registra próxima ação, sem publicar status de autorização, reabrir PR ou produzir certificado. **Regra fail-closed de execução:** o comando `mission-supervisor.py` sempre retorna exit code `2`, mesmo quando o JSON é estruturalmente válido, porque nenhum dado offline equivale à certificação assinada por origem protegida. O JSON emitido em stdout serve ao diagnóstico; CI e consumidores não podem converter exit `0` de diagnóstico em status de aprovação. Essa proibição é coberta por testes negativos.

## 3. Matriz negativa e prevenção

| Cenário | Comportamento obrigatório |
| --- | --- |
| N01 DONE sem merge e checkpoint | Nunca CERTIFIED |
| N02/N14 PR incompatível ou escopo ampliado | Bloquear, salvo sub-PR explícita do contrato |
| N03 contrato da branch em vez da base protegida | Não aceitar |
| N04 status stale/skipped/neutral, zero ou múltiplo | Não considerar PASS |
| N05/N12 HEAD/base ou revisão antigos | Invalidar recibos vinculados |
| N06 autocertificação | Bloquear como prova independente |
| N07 interrupção/runner cancelado | Não produzir PASS |
| N08 dois retries sem delta | Exigir causa nova, não repetir |
| N09 sessões concorrentes | Exclusão mútua com lease; conflito não CERTIFIED |
| N10 cancelamento sem titular | Não cancelar |
| N11 erro de API/autenticação/JSON | FAIL fechado |
| N13 grupo ambíguo, publisher ou status de origem incorreta | Não publicar success |
| N15 publicador indisponível | Bloquear e usar recuperação autorizada |
| N16 status de admissão sem novo status do grupo | Não liberar merge |
| N17 review, autorização específica revogada ou inválida | Não liberar merge, mesmo com checks verdes |

**N17(c):** caso distinto de N17(b). Em fila isolada deve existir PR de **autoria terceira autorizada**, e as duas contas `contaos9999` e `Edivan5002` devem ser elegíveis como revisoras simultâneas. A revogação somente da autorização deve bloquear o grupo mantendo ambas as reviews `APPROVED`. Sem essa topologia e prova, `N17(c)=BLOCKED_EXTERNAL` para ativação, nunca PASS sintético. Não criar contas ou ampliar permissões sem autorização.

## 4. Dois estágios do status privilegiado

O contexto reservado é `ContaOS P0-ABS Mission Lock`, emitido **somente** por App dedicado, com `integration_id` conferido. A avaliação de entrada da PR requer SHA efetivo, base viva, PLAN/contrato protegidos, checks vigentes, parecer e autorização. Um novo sucesso separado no SHA do `merge_group`, após revalidação e vínculo autenticado da PR única, seria necessário para o merge.

Este BUILD **não cria nem ativa** esse App nem adiciona contexto ao ruleset. O workflow só faz diagnóstico e testa comportamento fail-closed. Sem App, origem confiável e prova em fila, resultados são `NO-GO`, jamais checks válidos para alterar proteção.

## 5. Provas para a futura ativação

Exigir: matriz de eventos `pull_request`, `push` e `merge_group`; testes RED/GREEN e mutantes; regra `full_diff` aplicada a qualquer extensão do BUILD #690; verificação de auth da PR no push por evidências GitHub; resolução do manifesto **na base anterior ao diff**, não em `origin/main` pós-merge; vínculo real da entrada única da fila com SHA/base/PR; status do App no SHA requerido; revogação de autorização mesmo após `success`; recuperação sem retirar proteções. Se o provider GitHub não suportar prova atômica suficientemente segura para a revogação, manter `ativacao_autorizada=false` e registrar `BLOCKED_EXTERNAL/NO-GO`.

A ativação e a configuração administrativa requerem autorização separada do titular, snapshots do ruleset, testes negativos reais e readback de enforcement em main. Isso não se deduz de jobs verdes ou de simulação local.


## 5.1. Matriz obrigatória de pré-certificação do BUILD #690

**Status:** esta matriz é obrigação de execução, não declaração de PASS. O implementador deve anexar logs, hashes e o HEAD exato antes da auditoria independente. Provas de SHA anterior são históricas.

| Gate | Prova exigida antes da auditoria |
| --- | --- |
| NR-005 / documentos comuns | Caso de push documental por squash/merge e de PR sem associação legítima sem relação com #690 preserva N/A, sem exigir dois pais ou manifesto do BUILD. |
| NR-005 / BUILD válido | Push da #690 exige PR autenticada, dois pais/HEAD corretos, manifesto da base anterior e diff completo dentro de 14 caminhos. |
| NR-005 / falsificações | PR errada, associação ausente, squash da #690, documento extra, script extra, renomeação e alteração de modo devem falhar. |
| NR-009 / base avançada | PR com main avançada compara a base do evento viva com o HEAD e usa merge-base apenas para construir o diff, sem falsa reprovação. |
| Node 24 / testes | Runner usa formato TAP explícito; teste selecionado exato, 0 tests e status falso são recusados. |
| Segurança runner / N06 | Job Codex autogerenciado com identidade local é removido até comprovação administrativa externa do isolamento do host, runner group, workflow/ref e credenciais gh. |
| Segurança Actions | Workflow observador usa runner GitHub hospedado, permissões apenas read, checkout main sem credenciais persistentes e sem escrita, merge ou aprovação. |
| WDG-01 / origem | Fonte autenticada confirma main e SHAs das PRs 679 e 690 contra contrato; divergência produz REVALIDATE_HEAD, nunca certificado. |
| WDG-02 / progresso | Diagnosticar CI com falha, ausência de checks, CI parado por 2h, ausência de atividade por 24h; determinar próxima ação sem agir autonomamente. |
| WDG-03 / fail-closed | Contrato adulterado, API incompleta e cancelamento/certificado autodeclarados permanecem bloqueados; CLI diagnóstica nunca devolve sinal de aprovação. |
| N01-N17 | Todos os negativos Python aplicáveis passam, incluindo revisão, autorização, head/base, grupo e check antigo. Ensaios físicos de fila/App continuam NO-GO até autorização. |
| N13 / fila | Provar em Git temporário PR com múltiplos commits e impedir grupo extra; validar states e árvores, sem confundir simulação com fila real. |
| Regressão global | Rodar cinco checks no mesmo HEAD, incluindo RCA operacional, 1.266 Vitest, lint, typecheck, build, Teste C Playwright, P0-NR, protect-types e controlador Windows offline. |
| Evidências | Registrar job URLs, SHA dos checks, resultado TAP, hash SHA-256 do artefato visual, diff exato, limitações HML e causa de qualquer skipped. |
| Revisão independente | Somente com HEAD congelado, matriz comprovada e checks terminais solicitar nova análise Codex 3.1.4. Preservar RunId/hash, não autoconceder APPROVED. |
| NR-005 / manutenção posterior | PR documental posterior pode alterar o checkpoint original da #690 por squash; PR futura com PLAN próprio pode alterar workflow compartilhado. A identidade do BUILD é o número autenticado da PR, nunca a interseção de caminhos com a antiga allowlist. |
| NR-005 / modos Git | O diff em modo raw deve vincular old/new para cada caminho e renomeação, bloquear chmod 100644 ↔ 100755, symlink/gitlink e mode change com caminho inalterado. |
| NR-005 / schema | `schema=contaos.p0.gov-plan.v1` obrigatório na validação pura e na prova operacional do manifesto #690; outros campos corretos não substituem schema. |
| WDG-04 / checks obrigatórios | Três checks do contrato presentes uma única vez por PR/HEAD vigente, status completed/success; check avulso protect-types não substitui os obrigatórios. Lista incompleta produz BLOCKED_EXTERNAL, próxima ação correta e required_checks_complete=false. |
| WDG-05 / proveniência | A coleta guarda id, app.id e head_sha, compara check ao HEAD da PR, lê PR/base/main novamente e rejeita paginação incompleta, origem ausente e deriva durante a coleta. |
| WDG-06 / estados terminais | Contratos CERTIFIED e CANCELLED_BY_OWNER com recibos autodeclarados, mesmo estruturalmente válidos, nunca são retomados como ACTIVE; exigem prova externa. |
| WDG-07 / permissão REST | O token temporário de `schedule` possui `checks: read` além de contents/actions/pull-requests read, sem escrita; o observador não vira publicador. |

**Condição de aceite dos três achados da auditoria do HEAD 09bf546:** a execução das provas negativas deve incluir manutenção posterior do checkpoint e dos workflows por PR de identidade distinta da #690, checklist dos três required checks com apenas protect-types, contratos terminalmente falsificados, manifesto de schema inválido, chmod e mode change em renomeação. Os casos puramente simulados não substituem API/CI de HEAD real. O diagnóstico pode estar BLOCKED_EXTERNAL e o workflow continuar tecnicamente verde apenas se o relatório preservar a falta de prontidão, nunca emitir PASS de missão.

## 5.2. Matriz de prevenção das quatro regressões encontradas no HEAD 502710a

**Pré-integração NR-005:** o manifesto protegido `docs/frontend/planos/P0_GOV_PLAN_690.json` não pode ser modificado, renomeado ou removido por qualquer PR posterior. O guard verifica o `full_diff` incluindo os dois lados de renomeações **antes** da resolução da PR e **antes** do retorno N/A, nos eventos `pull_request`, `merge_group` e `push`. Documentos comuns fora desse caminho preservam o rito documental original. A validação pura do RCA também não retorna N/A para o manifesto alterado.

**Fila NR-009/N13:** a identidade do checkout vem de `git rev-parse HEAD` e `HEAD^{tree}` reais. `GITHUB_SHA`/`GITHUB_REF` são atributos do evento e devem coincidir com o checkout real. A ref temporária viva `gh-readonly-queue/main/pr-*` é consultada via API; HTTP 404, SHA diferente, grupo removido, mudança de HEAD/árvore ou estado `QUEUED`, `LOCKED`, `UNMERGEABLE` falham fechados. Conferir novamente GraphQL da entrada/PR, ref do grupo, `main` e HEAD local ao final evita aceitar deriva durante a coleta. Isso não ativa nem publica status privilegiado da fila.

**Origem N04/N13:** somente checks obrigatórios emitidos por `integration_id=15368` (valor confirmado no ruleset ativo `26495643` em 21/11/2026) contam como válidos. Check homônimo de outra App ou duplicado não integra `required_checks_complete`. Conferir id, SHA atual, status `completed/success` e os três nomes completos. Mudança futura do ruleset exige novo readback e autorização, não admissão dinâmica de emissor arbitrário.

**Ciclo de vida:** preservar `state`, `merged`, `merged_at` e `merge_commit_sha`. PR fechada sem merge indica `REOPEN_OR_REPLAN_CLOSED_PR`; PR efetivamente integrada no GitHub indica `VERIFY_POST_MERGE_READBACK`. Ambos impedem a ação de revisão como próximo passo e não constituem `CERTIFIED`, mesmo com checks verdes. Dados ausentes ou contraditórios falham fechados. Readback da `main` é operação distinta.

**Revalidação no encerramento do job:** Zero-Drift, Teste C e P0-NR repetem a consulta autenticada do resolvedor depois dos seus testes e imediatamente antes de concluir com `success`, apenas no evento `merge_group`. A dupla leitura GraphQL/REST do resolvedor evita aceitar ref removida ou entrada que perdeu elegibilidade durante a execução, sem conferir qualquer privilégio ao workflow. Na ausência de grupo vivo, o job falha fechado. O CI de PR comum continua com os mesmos nomes e permissões de leitura.

**Regressão obrigatória:** executar novos casos nas três suítes Node/Python, incluindo Git temporário, e cinco checks no mesmo HEAD, preservando testes anteriores, estado `skipped`, limitações HML e provas reais de API. Não iniciar auditoria independente antes de a matriz integral estar comprovada.

## 5.3. Pré-auditoria técnica do assistente como condição anterior à pré-certificação

O implementador submete a PR #690 a uma **pré-auditoria técnica executada pelo próprio assistente**, em análise distinta da implementação e **sem independência institucional**. Essa etapa replica a matriz de verificação do auditor Codex 3.1.4, mas **não substitui** o parecer independente, o review nativo nem a autorização do titular.

**Ordem obrigatória:** implementação e testes de evidência → pré-auditoria do assistente com veredito explícito → somente após `PASS` válido, liberação da **pré-certificação interna** → auditoria técnica independente obrigatória → revisão formal `Edivan5002` → merge protegido/readback, quando autorizados. Os cinco checks de CI são pré-requisitos de prova, mas sozinhos não liberam o estágio de pré-certificação.

**Matriz do parecer:** (1) escopo 14/14 e manifesto integrado na base anterior; (2) causa raiz de cada achado anterior e teste RED/GREEN; (3) eventos `pull_request`, `push`, `merge_group` e verificação da identidade efetiva; (4) negativos e mutações N01–N17; (5) regressão dos fluxos comuns e integração entre componentes; (6) fronteiras de segurança, autorização, identidade e permissões; (7) proveniência, logs, hashes e conteúdo verificável de CI/artefatos no HEAD; (8) limitações, impedimentos e próximos gates. Para cada critério, registrar `PASS` ou causa documentada de `CHANGES_REQUESTED`.

**Parecer formal e vínculo:** publicar comentário na conversa da PR autenticada `contaos9999`, com texto analítico e recibo estruturado `CONTAOS_ASSISTANT_PREAUDIT_V1`, incluindo `run_id` próprio, SHA-256 do parecer, SHA exato do HEAD/base, 8 critérios, digest e ID do artefato Playwright. O registro é evidência de uma verificação do assistente, **não prova independente nem certificado de missão**. Um parecer posterior diferente de `PASS`, ou sobre outro HEAD/base, invalida imediatamente a liberação anterior.

**Gate executável de liberação:** job separado `P0-ABS Preauditoria Assistente (precert apenas)` no workflow `contaos-auditoria-controller.yml`. Lê via REST autenticada PR, `main`, manifesto da base, diff completo, comentários, cinco checks de mesmo HEAD e artefato de Teste C; exige `PASS` íntegro do último parecer e reconsulta HEAD/base antes de decidir. Sem recibo, com `CHANGES_REQUESTED`, check pendente/falhado, App estranha, artefato divergente ou base alterada, retorna `BLOCKED` e não libera a pré-certificação. O gate não altera branch protection, não publica status privilegiado e não autoriza merge.

**Ciclo de correção:** qualquer resultado diferente de `PASS` exige identificação de causa raiz, teste que reproduz a falha, correção, regressão integral e nova pré-auditoria no novo HEAD. Não converter falha em PASS por exceção administrativa. Se um impedimento externo impossibilitar a prova, registrar `BLOCKED_EXTERNAL` e manter o NO-GO; não prometer loop infinito/autônomo. Cada rodada é executada e documentada enquanto houver meios autorizados. Um `PASS` válido libera **somente a pré-certificação interna**, permanecendo obrigatória a auditoria independente.

**Critério de congelamento:** não publicar melhorias cosméticas nem reenviar auditoria sem delta causal. Falha nova exige causa raiz, teste negativo, correção e regressão no mesmo HEAD. Preflight verde não elimina possibilidade de novo achado, nem altera o dever de auditoria independente de código.

**Fronteira administrativa:** reinserir o runner Windows com perfil gh local ou criar App/status de missão, novo required check, fila e ruleset depende de controle externo comprovado e autorização separada. Mesmo integrado à main, o watchdog agendado é best effort e somente leitura. N17(c) permanece NO-GO para ativação até ensaio isolado com terceiro autor e duas aprovações elegíveis.

## 5.4. Prioridade Zero: auditoria adversarial obrigatória, não mero autoteste

Esta regra complementa a seção 5.3 e prevalece para cada novo HEAD do BUILD #690. O assistente implementador é responsável por uma **segunda análise deliberadamente cética**, sem presumir correção por CI verde. A pré-auditoria interna não é independente da equipe que implementou e não pode declarar a revisão formal do auditor externo.

1. **Inventário inicial:** congelar o HEAD/base da PR, o HEAD protegido da main, os 14 caminhos reais, os blobs Git, o manifesto e as condições de NO-GO. Fazer matriz de estados para PR, grupos de merge, workflows e jobs. Uma evidência anterior só serve ao novo HEAD se provar identidade e vigência.
2. **RED reproduzível:** para cada defeito e nova hipótese adversarial, executar cenário que falha na revisão vulnerável. Registrar o teste, o log e o run/commit de origem. Não usar uma simples alegação de que "falharia".
3. **Correção causal:** tratar a causa no produtor, no verificador e no consumidor da evidência, inclusive concorrência e dependências, mantendo permissões mínimas. Emendas ao teste não podem reduzir a segurança do código.
4. **GREEN e negativos adversariais:** cobrir sucesso legítimo e falhas por HEAD/base divergentes, blobs e caminhos iguais com conteúdos diferentes, parecer posterior, run/attempt/job estranho, artifact de outro contexto, download/cache stale, check duplicado, escopo adulterado, token/App inválido, falha de API/paginação e estado skipped/neutral/failure. Incluir mutações e regressão dos contratos N01–N17.
5. **Segunda leitura do diff 14/14:** reexaminar integralmente scripts, workflows, contratos, documentação e testes, com lentes de identidade, autenticação, invariantes, TOCTOU, confiança em dados externos, revogação, segurança do runner, rollback e cobertura. Produzir achados novos mesmo quando o CI passa.
6. **Repetição:** qualquer resultado diferente de PASS no escopo executável requer nova correção, novas evidências e nova pré-auditoria sobre o HEAD resultante. É proibido converter BLOCKED/CHANGES_REQUESTED em PASS por alteração de critério ou dispensa silenciosa.
7. **Liberação:** somente registrar PASS quando os cinco checks obrigatórios estiverem success no HEAD exato, com logs verificados, Teste C autenticado até run/attempt/job/step/artefato, matriz completa e readback vivo da PR/main/comentários/checks. O PASS permite exclusivamente a pré-certificação interna; revisão Codex, review nativo, merge e ativação mantêm gates próprios.

**Prova RED adicional após o parecer externo de 21/11:** workflow `44878619684`, controlador Windows, teste `test_watchdog_adversarial_offline_base_drift_is_not_active`: retornou `ACTIVE` em vez de `BLOCKED_EXTERNAL`. A implementação passou a vincular a base ao `last_proven.merge_sha` protegido, tanto na coleta quanto na avaliação. O CI no HEAD final e readback continuam necessários. Outro teste de consistência exige `required_checks_complete=false` com HEAD alvo divergente. Todos os testes devem isolar suas fixtures; um teste que modifica listas globais não é evidência de cobertura válida.

**Limitações não dispensáveis:** teste sintético não prova ativação da fila real; screenshot Playwright não prova sessão HML autenticada se o log a declarou não verificada; relatório do assistente não é parecer independente; CI verde não autoriza PROD, backend, revogação, N17(c) nem merge. Registrar `BLOCKED_EXTERNAL` quando uma prova exigir terceiro autor, credencial administrativa ou ambiente não disponível.

## 5.5. P0-ABS ADVERSARIAL V2 — protocolo executável e proibição de falso PASS

**Autoridade e limites:** pré-auditoria assistida não é uma auditoria institucionalmente independente. A segregação em implementador, pré-auditor cego e meta-auditor representa funções metodológicas distintas; a auditoria Codex independente e a revisão formal de terceiro continuam obrigatórias. Todo resultado exige evidência, não mero preenchimento de campos ou uma declaração do próprio autor.

**Dez camadas, sempre na ordem:** (1) congelar HEAD/base/main/manifesto e hashes; (2) reconstruir contratos sem presumir correção do implementador; (3) mapear atores, permissões, invariantes e máquina de estados; (4) elaborar ataques novos sem restringir-se ao parecer anterior; (5) produzir RED reproduzível na revisão vulnerável; (6) corrigir a causa raiz e executar GREEN, negativos, mutações e regressão; (7) testar estados iniciais, transições legítimas, ilegítimas, recuperação pós-merge e revogação posterior; (8) revisar integralmente o diff e os consumidores relacionados; (9) meta-auditar a auditoria, testando falsos positivos e contaminação de fixtures; (10) revalidar o GitHub vivo e só então registrar PASS no HEAD exato. Falha em qualquer camada reinicia o ciclo causal, nunca dispensa o requisito.

**Doze perspectivas obrigatórias:** segurança/autorização, proveniência/integridade, concorrência/TOCTOU, ciclo de vida, estados/contradições, integração entre componentes, resiliência/API/timeout/paginação, governança/segregação, supply-chain/scripts executados, regressão de fluxos legítimos, observabilidade/diagnósticos falsos e ambientes operacionais/limitações HML. O recibo `CONTAOS_ASSISTANT_PREAUDIT_V2` exige doze resultados e quatro critérios adicionais: transições legítimas, proveniência relacional, revogação pós-decisão e segunda leitura/meta-auditoria. Os dados declarados no parecer não substituem o CI nem a verificação crítica real.

**Casos RED obrigatórios do parecer de 21/11:** (a) primeira execução do watchdog após merge autorizado da #690 não pode morrer antes de diagnosticar; compare checkpoint #691 e SHA de integração usando GET autenticado da PR #690 e do ref main. Advance não comprovado continua bloqueado; (b) artifact do mesmo `run_id`, porém da tentativa anterior, não pode ser confundido com a tentativa atual, inclusive quando ZIP e digest são íntegros; (c) parecer impeditivo publicado após o check SUCCESS exige nova validação no consumo da autorização, inclusive revisão nativa `CHANGES_REQUESTED`. Nunca atribuir validade temporal permanente a um check histórico.

**NR-006, repetição legítima dos checks no mesmo HEAD:** o evento GitHub `pull_request_review` pode produzir novos jobs `P0-ABS Adversarial V2 executavel` e `Controlador offline Windows` sem modificar o commit da PR. O consumidor deve distinguir checks homônimos de execuções anteriores por identidade autenticada do GitHub Actions e selecionar o job mais recente, nunca a primeira entrada da lista. A seleção é conservadora: um job mais recente `queued`, `in_progress`, `failed` ou de origem não comprovada continua `NO_GO`. Quando a nova execução está GREEN, a comprovação causal anterior pode ser preservada **somente se o job antigo também for revalidado no GitHub por ID, SHA, origem, steps e vínculo com o recibo imutável**. `COMMENTED` isolado não altera a decisão formal nem invalida o HEAD; `CHANGES_REQUESTED` vigente bloqueia, mesmo que todos os checks estejam verdes. A revalidação final detecta qualquer mudança de comentário/review/check durante a coleta. A existência de várias execuções exitosas autenticadas **não** constitui aprovação externa ou autorização de merge.

**NR-006, RED causal por cenário (obrigatório):** um run vermelho genérico não comprova mais de uma causa. O gate exige três registros `adversarial_v2.red_cases` distintos, com identidade do caso, SHA vulnerável, blob do arquivo, resultado defeituoso observado, resultado GREEN esperado, HEAD GREEN e IDs do run/job GitHub. O CI executa separadamente `P0 V2 CAUSAL_RED watchdog_postmerge`, `P0 V2 CAUSAL_RED artifact_attempt` e `P0 V2 CAUSAL_RED review_comment`, recuperando por `git show` o código histórico imutável para reproduzir os defeitos, e exigindo o resultado correto na revisão atual. Watchdog vulnerável `54b596f4...` (blob `7f80dd25...`); artefato vulnerável `7e34fe41...` (blob `38072d1d...`); revisão vulnerável `caa351c6...` (blob `a85931fb...`). Divergência, duplicidade, troca de casos, SHA e blob ou etapa SKIPPED implicam NO-GO. As falhas das rodadas anteriores do watchdog não podem ser apresentadas como RED do ZIP ou da revisão.

**NR-006/NR-009, decisões e revalidação:** `COMMENTED` não modifica a última decisão formal de uma pessoa na mesma revisão HEAD. Somente uma nova decisão `CHANGES_REQUESTED`, `APPROVED` ou `DISMISSED` reconfigura o estado decisório. A leitura final deve revalidar `draft=false`, `merged=false`, HEAD/base, reviews, comentários, checks e artefato não expirado (ID, nome, digest e run/HEAD), com um GET adicional do ZIP antes do veredito. Bases antigas de PRs, desde que sejam SHAs sintaticamente válidos, são coletadas e emitidas como `REVALIDATE_HEAD`; dados malformados, ref errada ou mudança durante o readback permanecem erro/bloqueio. Nunca descartar uma observação autêntica de base divergente antes do diagnóstico.

**Vigência e consumo:** o job de CI de pré-auditoria não cria status privilegiado nem revoga magicamente um check já encerrado. Antes de qualquer ato que consuma a pré-certificação, executar novamente o verificador live `--verify-assistant-preaudit`, ou o workflow `workflow_dispatch` da branch em HEAD exato. O consumidor deverá confirmar `pass=true`, `release=PRE_CERTIFICATION_ONLY` e HEAD/base ainda vivos; caso contrário NO-GO. Novas revisões formais passam também pelo gatilho `pull_request_review`, quando o workflow estiver disponível no evento; uma notificação de comentário não substitui essa prova. Rechecagem é necessária mesmo com cinco checks verdes.

**Classes de ataques não cobertas apenas por testes existentes:** comentário tardio, revisão de outro autor, job de outra tentativa, nome de artefato de outra tentativa, reupload de ZIP antigo, parent/árvore/blobs divergentes, base que avança, PR fechada sem merge, membro de fila removido, status skipped/neutral, arquivo renomeado fora da allowlist, check falsificado por App alheia, runner com script diferente do caminho operacional, API parcial, timeout, credencial revogada, ambiente real versus fixture. Para cada caso, verificar se a própria falha é detectada pela razão esperada, não por contaminação de outra fixture ou falha colateral.

**Quatro resultados somente:** `PASS` com evidência completa; `CHANGES_REQUESTED` com defeito reproduzível; `BLOCKED_EXTERNAL` para prova dependente de acesso/terceiro/ambiente; `INCONCLUSIVE` para evidências incompatíveis ou insuficientes. Só PASS permite pré-certificação interna. O ciclo corrige e reaudita cada novo HEAD; se a prova não puder ser obtida, preservar NO-GO e registrar exatamente a dependência. Repetição de check sem mudança causal não é correção.

**Não habilitar:** status privilegiado, novos checks obrigatórios, ruleset, merge queue, runner local, backend, Supabase ou PROD com base neste protocolo. O BUILD V2 mantém `ativacao_autorizada=false` e o escopo de 14 caminhos.

## 5.6. Interpretação normativa vinculante e fronteiras de autorização

**Regra de interpretação:** este protocolo distingue requisitos de pré-certificação técnica do BUILD, requisitos de revisão independente, requisitos de merge protegido e requisitos de ativação privilegiada. São quatro decisões diferentes; o PASS de uma não produz PASS, dispensa ou equivalência nas demais. Quando uma condição se aplicar a mais de uma etapa, cada consumidor precisa de prova atual da sua própria autorização. Em qualquer conflito que não possa ser resolvido pelas regras de escopo abaixo, a decisão é `INCONCLUSIVE` ou `BLOCKED_EXTERNAL`, nunca `PASS`.

**V1 versus V2 do recibo:** a referência histórica a `CONTAOS_ASSISTANT_PREAUDIT_V1` na seção 5.3 descreve o primeiro contrato de recibo. Para o BUILD da PR #690 no HEAD que contém a seção 5.5, a exigência normativa mais específica é `CONTAOS_ASSISTANT_PREAUDIT_V2`, com doze perspectivas, quatro critérios suplementares e três REDs causais autenticados. O recibo V1 não autoriza a pré-certificação V2 e não pode ser convertido implicitamente. Não modificar o recibo histórico; a decisão atual valida exclusivamente o V2.

**Cinco checks versus sete contextos de CI:** o conjunto base de cinco checks é exatamente `ContaOS Frontend Zero-Drift`, `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`, `ContaOS P0-NR-001 Integridade e Provas`, `protect-types` e `Controlador offline Windows`. O sexto produtor é `P0-ABS Adversarial V2 executavel`. O sétimo contexto é o próprio `P0-ABS Preauditoria Assistente (precert apenas)`, que verifica os seis predecessores e o recibo V2. **Proibição de dependência circular:** o gate de pré-certificação não deve exigir seu próprio check SUCCESS como condição prévia da decisão; a contagem de sete é pós-decisão. A exigência de três checks do ruleset vigente trata do enforcement nativo e NÃO equivale à prova dos seis predecessores e do gate. Os números são relativos a conjuntos distintos, não critérios alternativos que permitem ignorar um check exigido.

**Checks duplicados e reexecuções legítimas:** a exigência WDG-04 de check único aplica-se ao diagnóstico dos três checks protegidos no contrato do watchdog, cuja lista deve ser avaliada de acordo com sua autoridade e HEAD. Para a pré-auditoria do BUILD #690, o evento `pull_request_review` pode produzir múltiplos `check_runs` do mesmo nome e SHA. É obrigatório autenticar workflow, run, attempt, job, App, HEAD, evento e contexto, selecionar a execução vigente sem aceitar verde antigo sobre execução mais nova pendente/falha e preservar o veto formal vigente. Duplicidade de origem não autenticada, identidade ambígua ou leitura incompleta significa NO-GO.

**Estado operacional, certificação e ativação:** `ACTIVE` representa diagnóstico da missão, não certificação. `PRE_CERTIFICATION_ONLY` é aprovação interna do BUILD por evidências da PR e não permite `CERTIFIED`, merge, liberação da #679 ou ativação de `ContaOS P0-ABS Mission Lock`. `CERTIFIED` depende dos atos de integração, auditoria independente, aprovação elegível, readback de `main` e checkpoint integrado. N17(c), identidade do App dedicado, fila real, isolamento HML autenticado, RLS, PROD e autorização administrativa permanecem `BLOCKED_EXTERNAL` para ativação até evidência própria.

**Prova semântica por cláusula:** uma testemunha de teste localizada pelo nome, ou a contagem de 100% da matriz, é evidência de execução da suíte e não demonstra isoladamente todos os antecedentes, consequências, exceções e efeitos entre cláusulas. Para considerar uma interpretação completa, é preciso identificar: (i) sujeito e autoridade; (ii) estado ou evento antecedente; (iii) consequência positiva e negativa; (iv) interação com outras condições; (v) fonte de verdade e prova LIVE; (vi) critérios de revogação e nova tentativa; (vii) fronteiras de BUILD, merge e ativação. Qualquer categoria material sem teste ou fonte auditável é `INCONCLUSIVE` para completude semântica. Uma cláusula ambígua não pode ser resolvida por flexibilização de testes ou mudança silenciosa de critério.

**Estados de transporte versus veredito normativo:** a resposta JSON do gate pode usar `verdict=BLOCKED` e `release=NO_GO` para indicar recusa técnica temporária ou terminal; isso não é um quinto tipo de parecer de auditoria. Os quatro resultados da seção 5.5 classificam o parecer técnico: `PASS`, `CHANGES_REQUESTED`, `BLOCKED_EXTERNAL` e `INCONCLUSIVE`. É proibido interpretar `BLOCKED` do transporte como `PASS`, `CERTIFIED`, aprovação de reviewer ou autorização de merge. Um erro temporário de API ou prova insuficiente conserva o `NO_GO` e tem sua causa identificada; não se converte em exceção administrativa.

**Precedência:** proibições expressas de ativação, requisitos do PLAN protegido, autorização do titular e segurança fail-closed sempre prevalecem. As regras posteriores mais específicas de §5.5 e §5.6 esclarecem a forma de executar a pré-auditoria e não dispensam a auditoria independente. Este capítulo não concede autorização administrativa adicional nem altera o manifesto protegido.

## 6. Implantação, rollback e continuidade

1. Esta PR implementa código de diagnóstico, testes offline e adaptação de compatibilidade à fila **sem ativação**, com CI e revisão técnica independente de código.
2. A integração via PR protegida preserva a história anterior; não editar `src/`, `public/`, backend, PROD, `types.ts` ou dependências.
3. Se um guard precisar de outro arquivo fora dos 14 caminhos, interromper a alteração e solicitar emenda de allowlist; nunca criar exceção ampla.
4. Caso os testes de fila ou revogação falhem, registrar causa e manter o check privilegiado desabilitado, sem alterar proteções existentes.
5. Após merge protegido e readback, registrar HEAD, blobs, checks, evidências e próxima tarefa no checkpoint oficial. Certificação depende das provas efetivas e não da presença deste documento.

**Zero-Drift:** identidade visual N/A, por não alterar telas, componentes, rotas ou marca. Economia Lovable: uso de GitHub e CI, sem alterações de interface.

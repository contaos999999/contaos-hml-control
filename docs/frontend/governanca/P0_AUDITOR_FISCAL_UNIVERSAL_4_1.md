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

**Critério de congelamento:** não publicar melhorias cosméticas nem reenviar auditoria sem delta causal. Falha nova exige causa raiz, teste negativo, correção e regressão no mesmo HEAD. Preflight verde não elimina possibilidade de novo achado, nem altera o dever de auditoria independente de código.

**Fronteira administrativa:** reinserir o runner Windows com perfil gh local ou criar App/status de missão, novo required check, fila e ruleset depende de controle externo comprovado e autorização separada. Mesmo integrado à main, o watchdog agendado é best effort e somente leitura. N17(c) permanece NO-GO para ativação até ensaio isolado com terceiro autor e duas aprovações elegíveis.

## 6. Implantação, rollback e continuidade

1. Esta PR implementa código de diagnóstico, testes offline e adaptação de compatibilidade à fila **sem ativação**, com CI e revisão técnica independente de código.
2. A integração via PR protegida preserva a história anterior; não editar `src/`, `public/`, backend, PROD, `types.ts` ou dependências.
3. Se um guard precisar de outro arquivo fora dos 14 caminhos, interromper a alteração e solicitar emenda de allowlist; nunca criar exceção ampla.
4. Caso os testes de fila ou revogação falhem, registrar causa e manter o check privilegiado desabilitado, sem alterar proteções existentes.
5. Após merge protegido e readback, registrar HEAD, blobs, checks, evidências e próxima tarefa no checkpoint oficial. Certificação depende das provas efetivas e não da presença deste documento.

**Zero-Drift:** identidade visual N/A, por não alterar telas, componentes, rotas ou marca. Economia Lovable: uso de GitHub e CI, sem alterações de interface.

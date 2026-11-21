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

**Critério de congelamento:** não publicar melhorias cosméticas nem reenviar auditoria sem delta causal. Falha nova exige causa raiz, teste negativo, correção e regressão no mesmo HEAD. Preflight verde não elimina possibilidade de novo achado, nem altera o dever de auditoria independente de código.

**Fronteira administrativa:** reinserir o runner Windows com perfil gh local ou criar App/status de missão, novo required check, fila e ruleset depende de controle externo comprovado e autorização separada. Mesmo integrado à main, o watchdog agendado é best effort e somente leitura. N17(c) permanece NO-GO para ativação até ensaio isolado com terceiro autor e duas aprovações elegíveis.

## 6. Implantação, rollback e continuidade

1. Esta PR implementa código de diagnóstico, testes offline e adaptação de compatibilidade à fila **sem ativação**, com CI e revisão técnica independente de código.
2. A integração via PR protegida preserva a história anterior; não editar `src/`, `public/`, backend, PROD, `types.ts` ou dependências.
3. Se um guard precisar de outro arquivo fora dos 14 caminhos, interromper a alteração e solicitar emenda de allowlist; nunca criar exceção ampla.
4. Caso os testes de fila ou revogação falhem, registrar causa e manter o check privilegiado desabilitado, sem alterar proteções existentes.
5. Após merge protegido e readback, registrar HEAD, blobs, checks, evidências e próxima tarefa no checkpoint oficial. Certificação depende das provas efetivas e não da presença deste documento.

**Zero-Drift:** identidade visual N/A, por não alterar telas, componentes, rotas ou marca. Economia Lovable: uso de GitHub e CI, sem alterações de interface.

# P0 — Plano Único de Saneamento e Encerramento de Pendências do ContaOS 4.1

**Versão:** 1.1 (aprovada com veto expresso de desconstrução de certificações)  
**Data:** 14/11/2026 · **Estado:** APROVADO PELO TITULAR, integração documental sujeita a PR/revisão/CI.  
**Objetivo:** decidir e encerrar ou classificar as PRs antigas frontend #593/#590/#556 e backend #220/#219/#218, mais promover P0-NR-001 a check obrigatório do frontend quando houver permissão administrativa. **Não faz parte desta missão:** executar/certificar integração funcional V1, reiniciar fases certificadas, iniciar V2–V5, GATE PROD ou modificar produção.

## REGRA P0-LOCK-CERT: condição vinculante e absoluta da aprovação

> É vedado desconstruir, reabrir, rebaixar, invalidar, substituir, reinterpretar ou impor novamente provas de certificações já aprovadas, consolidadas e encerradas. Falhas de PR administrativa e de runner posterior NÃO alteram retrospectivamente resultados, ressalvas ou certificados aceitos. O saneamento não pode editar artefatos canônicos certificados nem criar certificado concorrente.

A regra vale acima da conveniência de resolver PR antiga. Se a correção proposta conflitar com uma certificação encerrada, **isolar a correção ou classificar a PR como SUPERSEDED/HOLD**; jamais modificar o certificado para viabilizá-la. Eventual defeito novo e material do produto será incidente técnico em processo futuro distinto, **não** reabertura automática da certificação dentro deste plano.

**Snapshot bloqueado:** `docs/frontend/planos/P0_SANEAMENTO_CERTIFICACOES_LOCK_2026-11-14.json` contém hashes Git dos artefatos certificados e o baseline. Durante o plano, conferir por leitura e diff os objetos protegidos. A presença desse JSON não afirma que existe um gate automático de imutabilidade: o veto é obrigatório no review e deve ser tratado como NO-GO quando violado.

**Certificados históricos preservados no snapshot:**
- V1 histórica `PASS` em `P0_ORDEM_POR_VERSAO_4_1.json`, merge `78f58e81b53d94defe4ac0e78e914ada7c47ba33`; dossiê `P0_V1_CERTIFICACAO_FASE8_2026-11-11.md`, com R-01/R-02/R-03 **já aceitas**, não equiparadas a PASS_REAL e sem PROD.
- Integração funcional V1 Fase 1: `integracao-funcional-v1/fase1/CERTIFICADO.md`, decisão PASS de inventário estático, observados limites originais; imutável na missão.
- Integração funcional V1 Fase 2: `integracao-funcional-v1/fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md`, **52/52 PASS**, sem reabrir.
- Checkpoints aprovados e integrados das fases da certificação V1 histórica no backend/GATE #138 são referências somente-leitura. A auditoria interna da V1 que permanece pendente é **outra** trilha, fora deste saneamento.
- **Manter estados atuais:** V1 funcional PASS; V1 integração interna PENDENTE; V2–V5 interna/cumulativa PENDENTE; PROD proibida.

## Preflight, estado inicial, owners e contrapartidas

**Frontend:** `contaos999999/contaos-hml-control` main `bbec18ee9bec17d07ff82a0f799ee9742f173ac7`; ruleset ativo `26495643`. Checks requeridos lidos no ruleset: `ContaOS Frontend Zero-Drift` e `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`. P0-NR-001 já roda em PR/push mas **ainda não é required check**. A API de branch-protection clássico não é legível pelo conector (403): não presumir poder de administração.
**Backend:** `contaos999999/develop` main `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`; `docs/tasks/active-task.json` identifica `C-CHAT-013-CONTEXTUAL-CITATION-REPLAY-20261109` como `ativa`. Não transferir ownership nem apagar `technical_subtask`/contexto C13 para liberar #220.
**Papel implementador:** `contaos9999`, sob PR protegida. **Revisão independente:** `Edivan5002`, sessão/conta distinta, revisão de diff, CI, evidência e invariantes. Sem autocertificação.
**Snapshot dinâmico:** atualizar HEADs, PRs, reviews e CI antes de qualquer edição e depois de cada merge. Não reutilizar run de SHA antigo.

## Critério uniforme de classificação de cada PR

A decisão deve ser somente uma:
- `MERGED_PROTECTED`: corrigida, testada, review APPROVED no HEAD exato, merged sem bypass e readback comprovado.
- `CLOSED_SUPERSEDED`: conteúdo já atendido por outro artefato integrado, com prova de equivalência, checkpoint e justificativa; sem perda de informação necessária.
- `HOLD_DEPENDENCY`: dependência/autoridade indisponível demonstrada; PR vinculada a causa, condição objetiva de reentrada e responsável; não declarar encerrada tecnicamente.
- `CHANGES_REQUESTED`: auditor aponta bloqueio específico com causa e teste; retorno a PLAN/BUILD, mantendo rastreabilidade.

NÃO fechar PR só para melhorar estatística. NÃO juntar arquivos ou versões concorrentes de certificação. Não liberar PROD em qualquer desfecho.

## Fase 0 — Inventário e LOCK das certificações

1. Reconsultar seis PRs abertas, HEAD, drafts, merges, checks, reviews, diffs e conflitos.
2. Reconsultar rulesets e manifestos ativos; confirmar que os certificados e evidências históricas do snapshot estão intactos.
3. Criar matriz imutável da entrada (PR→causa→dependências→certificados que NÃO pode alterar→decisão pendente).
4. Registrar checkpoint inicial com baseline exato e links.
5. Teste negativo de escopo: qualquer PR futura que altere arquivos `immutable_artifacts`, status V1 PASS, ressalvas, versões históricas ou PROD é **NO-GO** para este plano.

**Gate:** Fase 0 PASS somente se snapshot/HEAD/PRs tiverem sido lidos e o PLAN canônico estiver integrado por revisão protegida.

## Fase 1 — Frontend #593, Trilha A sem reexecutar request histórica

**HEAD antigo:** `db0ca054a264655e749709617cdd821e341da303`, mergeable=false. Escopo observado: workflow `contaos-trilha-a-authenticated.yml`, plano auxiliar e `PLANO_ATIVO.json`. CI antigo Zero-Drift/LOCK SUCCESS, mas Trilha A run `43042528333` falhou durante `playwright install --with-deps chromium` por DNS Ubuntu; não confundir com teste HML realizado.
1. Conferir estado novo da main e se a barreira para não selecionar request histórica continua faltando no workflow.
2. Corrigir apenas a seleção em merge sem request: mudança exata de `TRILHA_A_SOLICITACAO_UNICA.json` comparada ao primeiro pai. Request inalterada ⇒ preflight e job privado SKIPPED **sem erro administrativo**, mas sem alegar E2E PASS; request alterada ⇒ preflight original completo e FAIL-closed.
3. Distinguir erro DNS externo dos negativos de preflight; ambiente/instalação só são tratados por mudança autorizada, nunca removendo teste privado.
4. Se necessária, reconciliar PR #593 preservando mudanças posteriores da main e revalidar CI/review/merge/readback. Se já houver equivalência, fechar como SUPERSEDED com prova. **Proibido** recriar R14, renovar nonce ou reabrir certificado Fase 2.
**Gate:** ausência de uso de solicitação histórica, sem modificação da certificação.

## Fase 2 — Frontend #590 e #556, classificação sem recertificação

**#590:** `277ae3226b53e95c979b646f63253150154086fc`; adição de workflow SYS-03 + dossiê concorrente de certificação final V1. Checks antigos Zero-Drift/LOCK SUCCESS, review final ausente. Primeiro comparar item a item com evidências canônicas V1 PASS já integradas. É **PROIBIDO** mesclar arquivo que emita decisão V1 alternativa, substitua certificado existente, reabra ressalvas ou reescreva o PASS. Se conteúdo necessário para outro fluxo da V1, classificar `HOLD_DEPENDENCY_V1`; se obsoleto/superado, `CLOSED_SUPERSEDED` com links das provas.
**#556:** `6183d3959dfae9ecb23f55d8401a57acb79612dc`, DRAFT apenas proposta SQL V123, sem execução real. Comparar com contrato vigente; preservar referência documental futura sem executar SQL, tokens ou consultas para justificar integração. `HOLD_DEPENDENCY_V1` ou `CLOSED_SUPERSEDED` com decisão auditada.
**Gate:** decisão formal para ambas, sem tocar artefatos certificados. HOLD não equivale a trabalho implementado nem encerra V1.

## Fase 3 — Backend #220, GATE controlador horário sem apagar C13

**HEAD antigo:** `98a669614efdf92ddfff3d3fb1e8200e042b306a`, CI antigo SUCCESS. PR altera `docs/tasks/active-task.json`, incluindo troca de `technical_subtask` e redução de histórico C13. Essa substituição é **NO-GO** se mutilar contexto ativo.
1. Confirmar C13 ativa, coordenação/ownership e checkpoint no backend.
2. Criar autorização governamental **aditiva, escopada**, para arquivos do futuro controlador, preservando histórico, `allowed_paths` do trabalho concorrente e a tarefa C13, ou formalizar HOLD enquanto não houver compatibilidade.
3. Não alterar Auth, Edge, DB, Storage, RLS, PROD, executor horário ou dispatch.
4. Reexecutar Zero-Drift do HEAD final, review distinto, merge/readback se seguro.
**Gate:** autorização sem overwrites do contexto; #219 permanece bloqueada até GATE comprovadamente integrado.

## Fase 4 — Backend #219, controlador persistente read-only

**HEAD antigo:** `ec40f1a3f4c8728a5960c11c28afdb2d5`, DRAFT, Zero-Drift antigo FAIL por três arquivos fora da allowlist (`STATE_PROTOCOL_V1.md`, `executor-state-controller.mjs`, `.test.mjs`).
1. Somente após #220 integrado, conferir allowed_paths e HEAD baseline do backend.
2. TDD sobre Run ID, HEAD real, checkpoint append-only, ausência de token, execução inexistente, falha/rollback, duplicidade e ownership.
3. `dispatch_allowed=false` e somente leitura por padrão; não instalar cron adicional ou ampliar frequência horária.
4. CI/revisão/merge protegidos, readback e checkpoint. Se bloqueado por C13, `HOLD_DEPENDENCY` justificável, não substituição de tarefa ativa.
**Gate:** read-only demonstrado, nenhuma mutação de PROD/automação.

## Fase 5 — Backend #218, prova Chromium/fence sem adulterar restore

**HEAD antigo:** `45834cfd23acc133e7090ab5b7fad680393e8cbb`, DRAFT. CI antigo Zero-Drift run `42808510215` FAIL por `supabase/tests/p0_crud_global_browser.mjs` fora do escopo; Restore Isolado run `42808510355` FAIL ao detectar hash alterado de dependência documental protegida no mesmo arquivo. Job navegador privado teve SUCCESS parcial, **não supera os bloqueios**.
1. Reproduzir e separar as duas causas: allowlist e integridade do hash/prova.
2. Confirmar se o diagnóstico Chromium ainda é necessário ou já foi substituído.
3. Se necessário, PLAN/GATE específico, evidência nova com fonte e hash legítimos, testes de cleanup/negativos e restauração. Não reescrever hash histórico para mascarar alteração nem substituir evidência certificada.
4. Proibir logging de JWT, URLs privadas, headers, corpos ou segredos.
5. Zero-Drift, restore, backup, Chromium e auditoria independente no mesmo HEAD, merge/readback ou CLOSED_SUPERSEDED fundamentado.
**Gate:** ambas as falhas tratadas sem modificação retroativa de certificado ou evidências aprovadas.

## Fase 6 — Tornar P0-NR-001 required check sem reduzir regras

Ruleset `26495643` permanece ativo com dois required checks; o novo workflow `ContaOS P0-NR-001 Anti-Reincidencia` já executa, mas não é required check. A integração GitHub atual não garante permissão de editar rulesets.
1. Ler ruleset, job/check run exato, status e configuração de eventos.
2. Testar positivo e negativo no workflow de proteção (ledger íntegro e inválido, fingerprint duplicado, recibo falso, teste faltante, step skipped).
3. Exigir autorização administrativa real e manutenção integral dos checks Zero-Drift + Teste C, sem mudar suas condições.
4. Com permissão autorizada, adicionar P0-NR-001 **como terceiro check adicional**, consultar ruleset após a mutação e comprovar bloqueio da PR de teste FAIL / aprovação GREEN. Sem permissão, registrar `HOLD_ADMIN_AUTH`, responsável e ação humana necessária. Não proclamar P0 obrigatório antes do readback do ruleset.
**Gate:** required check real ativo e testado ou impedimento administrativo explicitamente registrado, sem bypass.

## Fase 7 — Auditoria, reconciliação e checkpoint final

1. Reconsultar as seis PRs, HEADs, branches, checks, reviews e histórico de merges/fechamentos.
2. Conferir todos os certificados do LOCK contra blob SHA e invariantes congelados. **Qualquer divergência em certificado histórico é NO-GO deste saneamento e deve ser investigada sem editá-lo.**
3. Confirmar que não houve mudança produto/RBAC/RLS/Auth/Storage/PROD nem substituição de C13 no backend.
4. Verificar estados do ledger NR-001..NR-008 e atualizar somente por regra própria, sem inventar `RESOLVIDO_COM_PROVA`.
5. Publicar decisão para cada PR: MERGED, CLOSED_SUPERSEDED, HOLD_DEPENDENCY ou CHANGES_REQUESTED com recibos. HOLD devidamente fundamentado não pode ser reclassificado como entregue.
6. Verificar se P0-NR-001 é required check do ruleset (ou HOLD_ADMIN_AUTH) e se os dois controles preexistentes permanecem.
7. Criar certificado de saneamento **independente dos certificados V1**: PASS apenas se todos os critérios de encerramento forem efetivamente atendidos; caso contrário `PASS_PARCIAL_COM_IMPEDIMENTOS` ou NO-GO, indicando dependência e próxima tarefa.
8. Registrar e **reler checkpoint na main**, com frontend/backend HEAD, commits, PRs, runs, resultados, revisão e continuidade futura sem repetir certificações.

## Critérios P0 transversais e protocolo único

`CHECKPOINT→PLAN protegido→review PLAN→merge PLAN→RED causal→BUILD mínimo→GREEN/NEG/REG→CI nativo→review Edivan5002→merge protegido→readback→checkpoint`.

- Erro conhecido: consultar `P0_NR_001_LEDGER.json`, causa e prevenção antes da primeira tentativa; após duas tentativas sem delta causal, RCA ampliada, não parar silenciosamente.
- Nunca reutilizar checks de outro HEAD, nem “PASS” de job com step E2E skipped.
- Nenhum merge de PR antiga só para reduzir inventário; preservar a ordem de dependências.
- O implementador `contaos9999` não aprova o próprio BUILD; o auditor `Edivan5002` não corrige código que está revisando.
- Zero-Drift, LOCK, Teste C, P0-RCA, P0-NR, RBAC/RLS, 25 fontes e crosswalk 100/97 continuam vigentes conforme seus escopos.
- Sem autorização PROD, sem manipulação de segredos, sem atualização de banco/Edge ou reabertura V1 funcional.
- Distinguir certificação histórica encerrada, **auditoria interna V1 pendente e tarefas futuras V2–V5**. Nenhuma das últimas duas autoriza retroceder a primeira.

## Entregas e regra de continuidade

**Artefatos iniciais:** este PLAN + JSON LOCK de hashes; somente arquivos novos, sem editar certificados/manifestos originais. A PR do PLAN exige CI, auditoria independente e merge antes de alterações de BUILD.  
**Fase operacional seguinte:** Phase 0 inventário/checkpoint; em seguida #593 apenas se necessário após verificar equivalência, deixando #590/#556 classificados sem tocar certificado. Backend #220→#219, depois #218; ruleset P0-NR por administração autorizada; auditoria final.

**REGRA DE ENCERRAMENTO:** não declarar saneamento global PASS enquanto houver falha verdadeira não tratada, falta de aprovação independente ou required check administrativo pendente. HOLD honesto preserva história e não desfaz certificação. A missão deve produzir evidências atuais, não exigir execução repetida de fases concluídas.

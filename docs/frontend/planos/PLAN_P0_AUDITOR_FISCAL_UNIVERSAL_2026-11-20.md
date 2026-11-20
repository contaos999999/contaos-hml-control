# PLAN P0-AUD-UNIVERSAL-001 — Auditor existente como fiscal universal de missões

**Data:** 20/11/2026 (Bahia). **Status:** PROPOSTO, exclusivamente documental. Sem BUILD, sem mudança de regras do GitHub, sem certificação e sem efeito retroativo. **Objetivo:** aperfeiçoar o auditor existente, sem criar outro agente, para que fiscalize a continuidade, a PRIORIDADE 0, a segregação de funções e a certificação objetiva de cada missão. Toda eficácia depende de validação do PLAN, CI, auditoria independente, revisão formal aplicável, merge protegido e readback.

## 1. Baseline e premissas verificadas

- Repositório frontend: `contaos999999/contaos-hml-control`; baseline de elaboração: `main@155ef9b594260e39fcd68f8083c42d8943c3210b`. Reconsultar a ref viva antes de qualquer BUILD; este baseline não é garantia de HEAD futuro.
- A PR #679 foi consultada como OPEN, não mesclada, `head=f827c023b6743e4a2efbf5bff6b4ce0e591d031b`, base `main`; ela é a missão inicial, mas **não** certifica sozinha a Fase 3.
- Auditor existente: `scripts/auditoria/auditar-pr.ps1` (3.1.4), `prepare-audit.py`, `auditor-runner.py`, `test-controller.ps1`, `test_preparation.py`, `test_runner.py`; worktree isolada, perfil `auditor` e revisão formal separada. Preservar seus métodos/recibos/histórico.
- Workflows existentes: `.github/workflows/contaos-auditoria-controller.yml` (testes offline do controlador), `contaos-p0-ci-monitor.yml` (fila informativa somente leitura), `contaos-frontend-zero-drift.yml`, `p0-nr001-anti-recurrence.yml`.
- Ruleset observado: ID `26495643` (`ContaOS-Zero-Drift-main`), ACTIVE em `main`, sem bypass actors, três checks obrigatórios: `ContaOS Frontend Zero-Drift`, `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`, `ContaOS P0-NR-001 Integridade e Provas`. São zero aprovações de PR **exigidas pelo ruleset**, mas permanecem vigentes revisões/autorizações formais exigidas por normas específicas. Não afirmar que já há check de missão obrigatório.
- Fontes obrigatórias: `AGENTS.md`, `docs/frontend/governanca/PROTOCOLO_ORQUESTRACAO_AUDITORIA_AUTOMATIZADA_4_1.md`, P0-RCA-001, P0-NR-001/ledger, PRIORIDADE ZERO por versão, ADR-DEV-002, GOV-004, LOCK-TYPES-01, Zero-Drift, PRD 4.1, fontes 100/97, checkpoint integrado. Revisar fonte viva de `contaos999999/develop` antes do BUILD, sem inspecionar tecnicamente backend.
- A regra canônica vigente proíbe declarar um mecanismo instalado com base apenas em documentação ou testes locais; vedado Lovable BUILD, backend/PROD, refactor de app e alteração do blob protegido `src/integrations/supabase/types.ts`.

## 2. Causa operacional e resultado esperado

**Lacuna:** o auditor avalia PR/HEAD e o monitor informa CI, mas não existe no baseline prova de um contrato universal de missão, trava de continuidade persistente e decisão de término verificável pelo GitHub. Um agente pode terminar seu turno ou produzir relatório sem que a missão esteja certificada. Isso **não** é prova de que alguém burlou o ruleset; é uma lacuna de fiscalização de missão distinta da proteção de merge existente.

**Resultado:** o mesmo agente `auditor` será o responsável institucional por fiscalizar missões. Implementadores não se autocertificam. Um **check técnico confiável** e um registro de missão protegidos verificam materialmente condições de avanço e encerramento. O auditor reporta o veredito sem assumir poderes de aprovar formalmente, mesclar por bypass ou operar PROD. Não criar sexto perfil/agente.

## 3. Regras projetadas — P0-ABS-001, P0-ABS-002 e continuidade até certificação

1. **Contrato imutável por revisão protegida:** `mission_id`, repositório, alvo, objetivo, escopo, critérios de aceite, checks, revisões, última etapa certificada, dependências e política de mudança/cancelamento. O contrato é consumido da `main` protegida, não da PR sob avaliação. Nunca aceitar que executor altere unilateralmente os critérios.
2. **P0-ABS-001:** antes de retomar implementação funcional da missão atual, comprovar gate contra bypass no GitHub. Condição PASS exige testes negativos e verificação do enforcement real, não apenas texto. O gate de missão não deve ser autoavaliação privilegiada do código da própria PR.
3. **P0-ABS-002:** missão em estado `ACTIVE`, `BLOCKED_EXTERNAL`, `CANCELLED_BY_OWNER` ou `CERTIFIED`. Não confundir interrupção da sessão com conclusão; `CANCELLED_BY_OWNER` exige determinação expressa. As etapas internas poderão ter estados próprios. A missão vigente continua prioritária, permitindo apenas PRs filhas explicitamente autorizadas para desbloqueio ou segurança.
4. **Mission Lock:** comparar PR/repo/objetivo com contrato na base protegida; bloquear transição para missão incompatível por check requerido. Concorrência de runners de auditoria sob lock/lease com identificador de execução para evitar escrita conflitante; falha do lock nunca produz CERTIFIED.
5. **Auditoria read-only:** reutilizar `auditar-pr.ps1` e perfil `auditor`; nenhuma escrita em código de app. Se o auditor precisar alterar o próprio mecanismo, exigir PR/PLAN e revisão de outra identidade elegível, sem autocertificação.
6. **Certificação em duas provas:** (a) código, contrato, testes, CI, Teste C e parecer independente no SHA; (b) revisão formal quando exigida, integração protegida, readback na `main`, checks pertinentes pós-merge e checkpoint integrado. `CERTIFIED` apenas com ambas as provas aplicáveis e recibos íntegros.
7. **Watchdog:** usar automação existente ou workflow mínimo read-only para identificar missão não certificada, ausência de progresso/heartbeat, CI parado, deriva de HEAD, falhas e falsas conclusões; produzir diagnóstico/alerta sem poderes de merge. O watchdog preserva o ponto de retomada e identifica a próxima ação executável pelo controlador existente em sessão autorizada. `schedule` GitHub é best effort. Serviço residente, tarefa agendada local, criação ou alteração de credenciais e retomada autônoma exigem PLAN e autorização próprios e ficam fora desta entrega.
8. **Antiestagnação:** após duas tentativas sem delta causal, proibir repetir o mesmo retry e exigir RCA ampliada. Não usar consumo de tokens, número de commits ou relatórios como prova de avanço. Reutilizar testes/pareceres válidos do mesmo SHA.
9. **Independência:** o auditor é autoridade de parecer técnico, não substituto de aprovação humana específica, nem administrador do ruleset. A exigência de check obrigatório do GitHub deverá ser configurada e provada por conta autorizada, com teste negativo real. Se permissões/plano não permitirem, registrar NO-GO de enforcement, nunca declarar impossível de contornar.
10. **Transparência:** status `BLOCKED_EXTERNAL` só com impeditivo verificável; preservar próxima ação, HEAD, checkpoints e modo de retomada. Não inventar mecanismo que possa manter a sessão viva contra o ambiente.

### 3.1. Origem, frescor e ativação do check obrigatório

- O contexto `ContaOS P0-ABS Mission Lock` será vinculado no ruleset `26495643` ao `integration_id` de um GitHub App autorizado e dedicado à publicação desse gate. O nome do contexto e o ID genérico do GitHub Actions não identificam um workflow confiável. Antes da ativação, comprovar o App instalado, seu ID e as permissões mínimas de publicação de status. Somente o avaliador confiável, executado de fonte protegida, pode acessar o publicador. O código sob avaliação não recebe a credencial, nem é executado com seu acesso. Sem integração autorizada e verificável, a ativação permanece `BLOCKED_EXTERNAL` e o certificado pendente. Provisionar App, credencial ou permissão fora do escopo exige PLAN e autorização específicos. [Origem e modo estrito na documentação do GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-status-checks-to-pass-before-merging).
- A regra obrigatória `merge_queue` do ruleset é a barreira de frescor. Configurar `ALLGREEN` e um elemento por grupo, com um build de fila concorrente e método `MERGE`. Registrar e validar a mudança de procedimento antes da ativação. Preservar os três checks requeridos atuais, a exigência de PR, o ruleset ativo, as proteções de deleção e force push e `bypass_actors=[]`. A passagem de `main` pela fila será obrigatória. Modo estrito e status no HEAD da PR, por si, deixam um resultado antigo elegível quando a nova base já é ancestral do HEAD. [Fila de merge e execução de checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).
- O App usa exclusivamente a API de **commit statuses** para esse contexto. Estados possíveis são `pending`, `failure`, `error` e `success`. Nenhum Check Run, incluindo `neutral` ou `skipped`, serve como recibo do App. O App executa duas decisões obrigatórias e independentes. Mensagens sem prova e eventos de outra origem não geram `success`.

  1. **Admissão da PR, antes da fila.** Alterações autenticadas da PR, das revisões e da base protegida disparam a reavaliação pelo App a partir do código e do contrato da ref viva. Confirmar a identidade da PR, repositório/base/HEAD e o SHA que o GitHub está usando para os checks de admissão. Se houver status no merge de teste, exigir que esse commit tenha como pais os SHAs atuais de base e HEAD e publicar nele. Quando o GitHub avaliar o HEAD, comprovar explicitamente que esse é o SHA efetivo de admissão antes de publicar nele. Ambiguidade, SHA obsoleto e evidência divergente deixam o status sem sucesso. Uma PR elegível recebe o status de admissão antes de qualquer evento de fila. O publicador não inclui a PR na fila. Somente o operador autorizado atua após a confirmação dos checks e revisões aplicáveis.
  2. **Autorização de merge pelo grupo.** Só um novo `success` no SHA temporário do grupo ativo, após a reavaliação integral da PR, dos gates, revisões aplicáveis e base viva, permite o merge. O status de admissão não é copiado e não pode dispensar a decisão no grupo. O App publica o resultado e o GitHub aplica a proteção. O App não tem permissão para mesclar ou contornar a fila. [GitHub sobre SHAs e conclusões de checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).
- Para cada `merge_group/checks_requested`, autenticar o evento e consultar o grupo ativo no GitHub. Vincular repositório, PR única, alvo, HEAD da PR, ref e SHA temporários do grupo, base do grupo, OID vivo de `main`, blob do contrato, identidade e execução. Comparar a composição do grupo com a PR e a base viva. Ler o contrato e o avaliador apenas dessa base. Reconsultar o grupo, o HEAD e a base viva imediatamente antes de publicar e de consumir o recibo. Divergência, grupo removido ou substituído, ausência de prova, falha do produtor e base diferente invalidam o resultado. A fila deve exigir o novo status do novo grupo antes do merge, inclusive quando a base nova já é ancestral do mesmo HEAD. Aplicar NR-009 na origem da leitura.

- O contrato protegido define quando a revisão formal é obrigatória. Em ambos os pontos de publicação, consultar a review pela API autenticada e verificar `APPROVED` vigente, `commit_id` igual ao HEAD exato da PR, revisor elegível distinto da autoria, independência do parecer e autorização expressa do titular para aquela decisão. O recibo de autorização deve vir do canal aprovado pelo protocolo, ser verificável pelo produtor, identificar repositório, PR, HEAD, base, decisão, titular e conta revisora, e permanecer vinculado ao recibo de auditoria e ID da review. Conteúdo declaratório de PR, comentário genérico e texto gerado pelo executor não constituem autorização. O BUILD deve provar a proveniência e a disponibilidade desse recibo antes da ativação. Sem autorização verificável ou review vigente, deixar o status sem sucesso, ainda que todos os outros checks estejam verdes. Reconsultar review e autorização na última verificação antes do status do grupo. Se ocorrer dismissal, revisão posterior impeditiva ou revogação após a avaliação, invalidar o resultado e retirar a tentativa afetada pelo rito da fila. Se o ensaio provar janela de merge com revisão inválida, a ativação fica em NO-GO até emenda que feche a janela sem reduzir controles nem alterar o número de aprovações nativas sem decisão expressa.
- Ensaiar em fila isolada a equivalência com a proteção pretendida. Antes de ativar em `main`, comprovar que todos os requeridos atuais são realmente executados no SHA do grupo em `merge_group`. A matriz deve cobrir PR/push/fila e mapear a base do grupo para os gates de diff. Se um gate exige metadados de PR, resolver vínculo autenticado com a PR única e falhar sem contexto. Abrir emenda prévia com allowlist e casos negativos para adaptar os workflows ou guards existentes necessários. Nunca representar evento de fila como push/PR nem pular checks aplicáveis. A avaliação confiável da missão roda sem executar código da árvore candidata com credencial de publicação.
- Integrar o BUILD revisado e as adaptações necessárias sob a proteção vigente, provar o produtor no ambiente de validação e só então ativar check e fila pelo rito administrativo autorizado. Na ativação, provar pela API a regra efetiva, identidade esperada e ausência de bypass. Usar uma PR de prova isolada sem código de produto e sem tocar a #679 para confirmar os negativos N04, N05, N13, N16 e N17 na proteção efetiva. Exigir nova execução verdadeira em grupo elegível e confirmar a eficácia da fila antes do certificado. O checkpoint de certificação precisa passar pela mesma proteção como PR filha prevista no contrato. Nenhuma etapa intermediária libera a #679.

## 4. PLAN técnico, escopo fechado e ordem de integração

**Fase PLAN (esta PR):** apenas este documento. Não mudar `AGENTS.md`, executáveis, workflows, checks, configuração de proteção ou registro oficial de retomada. Primeiro obter CI do PLAN, auditoria independente, aprovação formal quando exigida, merge e readback. Só então realizar BUILD numa PR separada que tenha este PLAN integrado em sua base.

**Allowlist candidata para futura PR de BUILD, sujeita à validação após a integração deste PLAN:**
- `AGENTS.md` (referência curta, sem duplicar instruções);
- `docs/frontend/governanca/PROTOCOLO_ORQUESTRACAO_AUDITORIA_AUTOMATIZADA_4_1.md`;
- `docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md` (nova norma);
- `docs/frontend/governanca/MISSAO_ATIVA_4_1.json` (contrato protegido; missão inicial PR679);
- `scripts/auditoria/auditar-pr.ps1` e `scripts/auditoria/test-controller.ps1` somente quando testes demonstraram necessidade;
- `scripts/auditoria/mission-supervisor.py` e `scripts/auditoria/test_mission_supervisor.py` (novo módulo interno, **não** outro agente);
- `.github/workflows/contaos-auditoria-controller.yml` e eventual novo `.github/workflows/contaos-missao-auditoria.yml` (check confiável e watchdog read-only);
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` (checkpoint apensado, nunca sobrescrever histórico);
- `docs/frontend/governanca/P0_NR_001_LEDGER.json` **somente** com ocorrência real causalmente comprovada;
- `docs/frontend/planos/PLANO_ATIVO.json` somente conforme validação do rito ADR-DEV-002, antes de qualquer BUILD.

A adaptação à fila exige emenda integrada antes de alterar gates atuais. O inventário inicial confirma que `contaos-frontend-zero-drift.yml` e `p0-nr001-anti-recurrence.yml` ainda não assinam `merge_group`. A emenda deve mapear também o workflow chamado do Teste C, os consumidores de `FRONTEND_DIFF_BASE` e as condições específicas de PR em `frontend-scope-gate.mjs`, `context-freshness-gate.mjs`, `p0-rca-impact-gate.mjs` e `p0-version-order-gate.mjs`. Fechar caminhos e negativos a partir do inventário completo da emenda. Até integração e prova da compatibilidade, a ativação da fila fica em NO-GO.

**Não autorizados:** `src/`, `public/`, dependências/lockfiles, tipos congelados, layout, rotas, backend `develop`, Supabase, PROD, scripts alheios à auditoria, credenciais e mudanças diretas na main.

## 5. Estratégia RED → GREEN e negativas

Antes de BUILD, reproduzir em testes isolados as lacunas do supervisor existente, sem alterar produção:
- N01: relatório DONE sem merge/checkpoint deve continuar ACTIVE.
- N02: PR divergente do contrato ativo deve FAIL, exceto sub-PR autorizada na base protegida.
- N03: contrato adulterado na PR não pode alterar decisão do gate.
- N04: check com SHA anterior, zero seleção, simulação, Check Run `skipped`/`neutral` ou status do App diferente de `success` não certifica. Demonstrar que nenhum deles torna elegível o grupo para merge.
- N05: mudança de HEAD/base viva invalida parecer e recibo. Em prova com HEAD da PR intacto, avançar a base primeiro a commit fora do HEAD e, em cenário próprio, a ancestral já incluído no HEAD. Preservar o sucesso antigo visível. O GitHub deve bloquear merge fora da fila e aguardar `success` no novo SHA do grupo com base correta. Grupo antigo ou publicação atrasada não libera o grupo novo.
- N06: auditor que edita mecanismo sob avaliação não pode autocertificar.
- N07: interrupção de sessão/runner preserva estado e não gera PASS.
- N08: duas tentativas sem delta exigem investigação causal ampliada, sem loop.
- N09: dupla execução concorrente não grava estados conflitantes.
- N10: CANCELLED exige autoridade explícita e mantém histórico.
- N11: ferramenta sem acesso, erro HTTP ou JSON malformado resulta NO-GO, não PASS.
- N12: troca de branch/commit após revisão invalida evidência afetada.
- N13: contexto ausente, resultado homônimo de outra origem, status no HEAD sem resultado no grupo e outra PR ou alvo compartilhando o HEAD não habilitam merge. Verificar o ID esperado, metadados da fila e bloqueio efetivo no GitHub.
- N14: PR de governança não abre exceção ampla a novas PRs incompatíveis.
- N15: com o publicador indisponível, grupo sem status válido fica bloqueado. Ensaiar recuperação autorizada, exigir execução nova e verificar que o ruleset continuou ativo e sem atores de bypass durante a recuperação.
- N16: sem o status obrigatório emitido no SHA que o GitHub usa para a PR, inclusive se publicado em SHA alternativo ou por origem diversa, uma PR com os demais checks verdes não entra na fila. Uma PR elegível recebe o status pré-fila, é admitida e permanece impedida de mesclar até receber uma segunda decisão no SHA do grupo.
- N17: com checks técnicos verdes, a PR ou o grupo permanecem bloqueados quando a revisão formal aplicável estiver ausente, revogada, dispensada, vinculada a outro HEAD ou emitida por conta inelegível, ou quando faltar autorização verificável. Ensaiar perda de validade entre admissão e avaliação do grupo e após publicação antes da conclusão da fila. Apenas review válida, nova avaliação e resultado no grupo correspondente liberam a tentativa.

GREEN: testes existentes do auditor, 17 negativos ou mais, status CI real da PR, Zero-Drift, P0-NR, LOCK, Teste C aplicável; lint/format compatíveis. Mutantes para predicados fundamentais de estado e conclusão. O workflow confiável deverá operar no código da branch protegida para aferir PRs, **sem checkout ou execução de código não confiável com token de escrita**. Observação: mesmo um workflow protegido recém-criado não é automaticamente um required check; verificar e exigir configuração específica do ruleset após implantação.

## 6. Segurança, impacto e rollback

Impacto planejado restrito à orquestração e governança. As regras de app, identidade visual BRAND-01, HML, RBAC/RLS, contratos API, rotas, tipos e certificações F1/F2 permanecem intactos. Riscos: bloquear PR legítima dependente, corrida na atualização do estado, falsos PASS de runs antigos, indisponibilidade da API GitHub, check criado pela própria PR e escalonamento de privilégio por workflow. Mitigações: contrato consumido da main, bloqueio fail-closed, testes negativos com exceções por dependência formal, identidade separada, menor privilégio, validação reprodutível dos SHA e controle independente.

### 6.1. Recuperação do publicador e rollback

Antes da ativação, registrar um responsável administrativo, o snapshot autenticado do ruleset, a última revisão confiável do publicador com SHA e hash, o caminho de reexecução protegido e a autorização específica para a recuperação. Ensaiar com a fila isolada uma indisponibilidade do publicador primário e a restauração fora do fluxo de merge, sem depender de uma PR que o App indisponível teria de validar.

1. Com o publicador indisponível, deixar a fila bloquear e registrar `BLOCKED_EXTERNAL` com grupo, PR, HEAD, ref viva, erro, responsável e próxima ação. Invalidar ou retirar pela interface da fila a tentativa afetada, preservando o diff e as evidências. Não promover uma conclusão anterior.
2. Se a instalação do App estiver utilizável, a pessoa autorizada reexecuta a versão confiável do publicador por ambiente protegido a partir do SHA e hash já verificados. Essa recuperação não altera a branch protegida nem desativa regras. Validar que o produtor restaurado lê a base viva e o contrato vigente, com o mesmo `integration_id`.
3. Se o App não puder publicar, a fila continua bloqueada. A única troca admitida é substituição administrativa expressamente autorizada para um App de contingência previamente aprovado, com o mesmo contrato, escopo e provas de publicação. Validar a contingência na fila isolada. Fazer alteração única do `integration_id` esperado e comprovar por readback que permaneceram ativos o contexto, a fila, os três outros checks, a proteção de PR, o bloqueio de deleção/force push e a ausência de bypass. Nunca alternar para origem livre nem remover o check para restaurar a fila. Preparar a contingência com governança própria se ela exigir credencial/permissão nova. Sem rota testada e autorizada, a ativação é NO-GO.
4. Recolocar PR elegível na fila conforme o rito e exigir o novo status no SHA do novo grupo. Registrar autorização, ator, horário, motivo, hashes, atualização administrativa se aplicável, readback e resultado negativo/positivo. Corrigir ou reverter o código por PR protegida somente após restabelecer a avaliação. A recuperação não certifica a missão nem libera a #679.

## 7. Gatilhos finais e responsabilidade por implantação

**Auditor:** diagnosticar a missão e emitir parecer. **Orquestrador:** conduzir implementação, sub-PRs e correções. **GitHub:** executar checks/merge protegidos, guardar contrato e evidências. **Titular:** conceder autorizações específicas e cancelar/mudar contrato quando necessário.

A próxima entrega é a **PR de BUILD**, iniciada somente após este PLAN integrar a main. Depois, comprovar o check e a eficácia do ruleset pelo rito da seção 3.1, executar os negativos no GitHub, validar o watchdog somente leitura e a retomada pelo fluxo existente. Integrar o checkpoint com recibos verificáveis e emitir o certificado com parecer independente. Até lá, a missão permanece ACTIVE ou BLOCKED_EXTERNAL conforme a evidência. Após a certificação, registrar a liberação da retomada da PR #679 em fluxo posterior.

**Não declarar a P0-AUD-001 instalada, o Mission Lock efetivo, o watchdog persistente ou a PR #679 certificada por causa desta PR documental.**


## 8. Resposta à auditoria independente do PLAN

O parecer `CHANGES_REQUESTED` do auditor 3.1.4 avaliou o HEAD `28aa4edd694d3b0648139d64c84ba4b1e99839b4`, base `155ef9b594260e39fcd68f8083c42d8943c3210b`, RunId `20261120T205632982Z-28aa4edd694d-cbe7473972474fafbc8db64f9a20694d` e SHA-256 do parecer `694D033C302671ED7419FA41E3D5F88765CD11EBE1382A0AC89632CD99E05D32`.

| Causa e classificação | Impacto e validação |
| --- | --- |
| Tratar base gravada ou sucesso anterior como prova de contexto atual, CONHECIDO NR-009. Origem indefinida no PLAN, NOVO. | A seção 3.1 especifica ref viva, identidade dedicada e modo estrito. N05 e N13 cobrem base avançada, resultado homônimo e reutilização cruzada. O modo estrito afeta a fila existente e exige avaliação antes da mudança administrativa. |
| Ausência do bloco obrigatório no próprio documento, CONHECIDO pelo precedente do PLAN 42. | Comparar o bloco abaixo com a fonte canônica §11.3 e verificar justificativa visual e decisão de economia. |
| Redação de implantação misturava retomada local persistente com watchdog somente leitura, NOVO. | Conferir as seções 3 e 7 contra o §12 do protocolo. N07 verifica preservação do estado durante interrupção e impede falso PASS. |

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.

`impacto_visual: N/A`. O PLAN é documental e a allowlist candidata se limita à governança, auditoria e workflows. Baseline visual, componentes, tokens, estados e matriz BRAND-01 de 1440/1280/768/390 px em claro e escuro são N/A neste escopo. A triagem do Teste C deve comprovar ausência de mudanças visuais. Qualquer alteração futura de UI requer PLAN próprio e matriz aplicável. O trabalho usa GitHub e ferramentas locais, com Lovable reservado à sincronização e visualização quando necessárias.


## 9. Revisão causal ampliada após a segunda auditoria

Segundo parecer `CHANGES_REQUESTED` no HEAD `ed8aba18bcb0c59497be19d4bd37983464bf4fd9`, mesma base viva, RunId `20261120T210655038Z-ed8aba18bcb0-a7eb34cc5ec0434da0d23a7117f310c2`, SHA-256 `B8F0EBF591B7E89FDB060D883398FF8E5F5D43472FD750956346A006819835D2`. O segundo parecer fechou Zero-Drift e o escopo somente leitura do watchdog.

- **NR-009 · frescor.** A primeira correção conferia a ref viva, mas deixava o status de admissão sujeito à identidade do HEAD. O modo estrito confirma ancestralidade e não identifica a tentativa de merge. A seção 3.1 agora exige prova final vinculada a grupo de merge com PR única e base viva. N04, N05 e N13 discriminam falhas de identidade, semântica, concorrência e reutilização do mesmo HEAD. O impacto em CI é explicitado na emenda prévia à ativação.
- **Recuperação · NOVO.** A reversão por PR dependia do check quebrado. A seção 6.1 exige ensaio prévio da recuperação protegida fora da fila e mantém a fila fechada se o produtor continuar indisponível. N15 exige prova de bloqueio, reexecução e readback das proteções. Troca de identidade exige autorização específica.


## 10. Contrato de admissão e revisão após a terceira auditoria

Terceiro parecer `CHANGES_REQUESTED` no HEAD `0ba8998e8a1fd5742c8fb67436a6950cc3241810`, mesma base viva, RunId `20261120T211618841Z-0ba8998e8a1f-7890a0b2bb96461fa57b0dbb999a77aa`, SHA-256 `E8757565A844D3DEEE11BC57EBB9C8CF34FECF30332846900BE0580EBCA8EF7E`.

- **Admissão · NOVO.** A redação anterior deixava opcional a publicação que precede a fila, criando dependência circular do evento de grupo. A seção 3.1 torna obrigatório o produtor pré-fila e define a seleção do SHA. N16 verifica bloqueio, admissão positiva e separação da decisão do grupo.
- **Revisão formal · NOVO.** O texto tratava a revisão na certificação, mas deixava implícita sua validação no publicador. O ruleset atual exige zero aprovações nativas e o protocolo exige revisão específica. A seção 3.1 antecipa a validação ao status de admissão e a repete no grupo, com verificação de autorização, identidade, HEAD, base e vigência. N17 cobre a falha com checks verdes e o impacto de uma revisão invalidada durante a fila.

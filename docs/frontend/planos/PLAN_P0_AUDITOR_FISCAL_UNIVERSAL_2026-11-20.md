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
- A ativação também exige `strict_required_status_checks_policy=true`. Preservar os checks atuais, a exigência de PR, os métodos de merge e a proteção contra deleção e force push. Manter `bypass_actors=[]`. O modo estrito se aplica aos checks atuais e pode exigir sincronização da branch e novo CI quando a base avançar. Avaliar o impacto na fila antes da ativação.
- O produtor lê a ref viva de `main`, o contrato nesse commit e os metadados autenticados da PR. O recibo associa repositório, PR, ramo alvo, HEAD, SHA avaliado pelo GitHub, OID da base viva, blob do contrato, origem e execução. Verificar a proveniência do SHA avaliado e que a branch inclui a base viva. Consultar HEAD e base viva novamente antes da publicação e do consumo do recibo. Mudança de contexto invalida a prova. O GitHub exige que a branch esteja atualizada mesmo se o check anterior continuar visível no mesmo HEAD. Aplicar a prevenção NR-009 contra uso da base gravada na PR como ref viva.
- Provar que a decisão vale apenas para a PR avaliada, inclusive com outro alvo ou outra PR no mesmo SHA. Se um sucesso puder ser reutilizado para autorizar outra PR, manter a ativação em NO-GO até emenda com mecanismo de vínculo à unidade de merge. Verificar pela API o ruleset efetivo, a origem do check e o bloqueio com contexto ausente, resultado de origem diversa ou base avançada. Usar PR de prova isolada, sem tocar na #679 e sem diff de produto. Atualizar a base da PR de prova e exigir uma execução nova do produtor confiável para verificar elegibilidade.
- Integrar o BUILD revisado com a proteção vigente antes da ativação. Comprovar a publicação confiável, aplicar a mudança administrativa autorizada e executar os negativos. O checkpoint de certificação passa pelo ruleset atualizado como PR filha prevista no contrato protegido. A #679 só é liberada depois da certificação.

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

Alterações de gates existentes, `frontend-scope-gate.mjs`, `p0-rca-impact-gate.mjs` ou do Zero-Drift que se revelarem estritamente necessárias exigirão emenda de PLAN com allowlist e testes antes do respectivo BUILD. Não presumir sua necessidade agora.

**Não autorizados:** `src/`, `public/`, dependências/lockfiles, tipos congelados, layout, rotas, backend `develop`, Supabase, PROD, scripts alheios à auditoria, credenciais e mudanças diretas na main.

## 5. Estratégia RED → GREEN e negativas

Antes de BUILD, reproduzir em testes isolados as lacunas do supervisor existente, sem alterar produção:
- N01: relatório DONE sem merge/checkpoint deve continuar ACTIVE.
- N02: PR divergente do contrato ativo deve FAIL, exceto sub-PR autorizada na base protegida.
- N03: contrato adulterado na PR não pode alterar decisão do gate.
- N04: check com SHA anterior, skipped, zero seleção ou simulação não certifica.
- N05: mudança de HEAD/base viva invalida parecer e recibo. Após avanço da base com HEAD da PR de prova intacto e sucesso anterior ainda visível, verificar bloqueio pelo modo estrito e exigir nova execução após atualizar a branch.
- N06: auditor que edita mecanismo sob avaliação não pode autocertificar.
- N07: interrupção de sessão/runner preserva estado e não gera PASS.
- N08: duas tentativas sem delta exigem investigação causal ampliada, sem loop.
- N09: dupla execução concorrente não grava estados conflitantes.
- N10: CANCELLED exige autoridade explícita e mantém histórico.
- N11: ferramenta sem acesso, erro HTTP ou JSON malformado resulta NO-GO, não PASS.
- N12: troca de branch/commit após revisão invalida evidência afetada.
- N13: contexto ausente, resultado homônimo com origem diversa e resultado de outro alvo ou PR no mesmo SHA não habilitam merge. Verificar a identidade esperada e o bloqueio efetivo no GitHub, além dos testes locais.
- N14: PR de governança não abre exceção ampla a novas PRs incompatíveis.

GREEN: testes existentes do auditor, 14 negativos ou mais, status CI real da PR, Zero-Drift, P0-NR, LOCK, Teste C aplicável; lint/format compatíveis. Mutantes para predicados fundamentais de estado e conclusão. O workflow confiável deverá operar no código da branch protegida para aferir PRs, **sem checkout ou execução de código não confiável com token de escrita**. Observação: mesmo um workflow protegido recém-criado não é automaticamente um required check; verificar e exigir configuração específica do ruleset após implantação.

## 6. Segurança, impacto e rollback

Impacto planejado restrito à orquestração e governança. As regras de app, identidade visual BRAND-01, HML, RBAC/RLS, contratos API, rotas, tipos e certificações F1/F2 permanecem intactos. Riscos: bloquear PR legítima dependente, corrida na atualização do estado, falsos PASS de runs antigos, indisponibilidade da API GitHub, check criado pela própria PR e escalonamento de privilégio por workflow. Mitigações: contrato consumido da main, bloqueio fail-closed, testes negativos com exceções por dependência formal, identidade separada, menor privilégio, validação reprodutível dos SHA e controle independente.

Rollback por PR/revert protegido e gates, sem force push, sem reduzir segurança. A reversão de um controlador que bloqueia erroneamente deverá preservar outro mecanismo independente de autorização e rastreabilidade, não produzir bypass irrestrito.

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

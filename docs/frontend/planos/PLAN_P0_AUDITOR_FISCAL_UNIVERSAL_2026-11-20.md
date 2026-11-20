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

## 3. Regras projetadas — P0-AUD-001 e P0-ABS-002

1. **Contrato imutável por revisão protegida:** `mission_id`, repositório, alvo, objetivo, escopo, critérios de aceite, checks, revisões, última etapa certificada, dependências e política de mudança/cancelamento. O contrato é consumido da `main` protegida, não da PR sob avaliação. Nunca aceitar que executor altere unilateralmente os critérios.
2. **P0-ABS-001:** antes de retomar implementação funcional da missão atual, comprovar gate contra bypass no GitHub. Condição PASS exige testes negativos e verificação do enforcement real, não apenas texto. O gate de missão não deve ser autoavaliação privilegiada do código da própria PR.
3. **P0-ABS-002:** missão em estado `ACTIVE`, `BLOCKED_EXTERNAL`, `CANCELLED_BY_OWNER` ou `CERTIFIED`. Não confundir interrupção da sessão com conclusão; `CANCELLED_BY_OWNER` exige determinação expressa. As etapas internas poderão ter estados próprios. A missão vigente continua prioritária, permitindo apenas PRs filhas explicitamente autorizadas para desbloqueio ou segurança.
4. **Mission Lock:** comparar PR/repo/objetivo com contrato na base protegida; bloquear transição para missão incompatível por check requerido. Concorrência de runners de auditoria sob lock/lease com identificador de execução para evitar escrita conflitante; falha do lock nunca produz CERTIFIED.
5. **Auditoria read-only:** reutilizar `auditar-pr.ps1` e perfil `auditor`; nenhuma escrita em código de app. Se o auditor precisar alterar o próprio mecanismo, exigir PR/PLAN e revisão de outra identidade elegível, sem autocertificação.
6. **Certificação em duas provas:** (a) código, contrato, testes, CI, Teste C e parecer independente no SHA; (b) revisão formal quando exigida, integração protegida, readback na `main`, checks pertinentes pós-merge e checkpoint integrado. `CERTIFIED` apenas com ambas as provas aplicáveis e recibos íntegros.
7. **Watchdog:** usar automação existente ou workflow mínimo read-only para identificar missão não certificada, ausência de progresso/heartbeat, CI parado, deriva de HEAD, falhas e falsas conclusões; produzir diagnóstico/alerta sem poderes de merge. Retomada automática local só pode ser anunciada se houver executor persistente **realmente instalado e testado**, com acesso mínimo, lease e idempotência. `schedule` GitHub é best effort, não prova de execução ininterrupta do Codex.
8. **Antiestagnação:** após duas tentativas sem delta causal, proibir repetir o mesmo retry e exigir RCA ampliada. Não usar consumo de tokens, número de commits ou relatórios como prova de avanço. Reutilizar testes/pareceres válidos do mesmo SHA.
9. **Independência:** o auditor é autoridade de parecer técnico, não substituto de aprovação humana específica, nem administrador do ruleset. A exigência de check obrigatório do GitHub deverá ser configurada e provada por conta autorizada, com teste negativo real. Se permissões/plano não permitirem, registrar NO-GO de enforcement, nunca declarar impossível de contornar.
10. **Transparência:** status `BLOCKED_EXTERNAL` só com impeditivo verificável; preservar próxima ação, HEAD, checkpoints e modo de retomada. Não inventar mecanismo que possa manter a sessão viva contra o ambiente.

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
- N05: mudança de HEAD/base viva invalida parecer.
- N06: auditor que edita mecanismo sob avaliação não pode autocertificar.
- N07: interrupção de sessão/runner preserva estado e não gera PASS.
- N08: duas tentativas sem delta exigem investigação causal ampliada, sem loop.
- N09: dupla execução concorrente não grava estados conflitantes.
- N10: CANCELLED exige autoridade explícita e mantém histórico.
- N11: ferramenta sem acesso, erro HTTP ou JSON malformado resulta NO-GO, não PASS.
- N12: troca de branch/commit após revisão invalida evidência afetada.
- N13: bypass de workflow/renomeação do check/rota por evento alternativo é rejeitado pela configuração efetiva.
- N14: PR de governança não abre exceção ampla a novas PRs incompatíveis.

GREEN: testes existentes do auditor, 14 negativos ou mais, status CI real da PR, Zero-Drift, P0-NR, LOCK, Teste C aplicável; lint/format compatíveis. Mutantes para predicados fundamentais de estado e conclusão. O workflow confiável deverá operar no código da branch protegida para aferir PRs, **sem checkout ou execução de código não confiável com token de escrita**. Observação: mesmo um workflow protegido recém-criado não é automaticamente um required check; verificar e exigir configuração específica do ruleset após implantação.

## 6. Segurança, impacto e rollback

Impacto planejado restrito à orquestração e governança. As regras de app, identidade visual BRAND-01, HML, RBAC/RLS, contratos API, rotas, tipos e certificações F1/F2 permanecem intactos. Riscos: bloquear PR legítima dependente, corrida na atualização do estado, falsos PASS de runs antigos, indisponibilidade da API GitHub, check criado pela própria PR e escalonamento de privilégio por workflow. Mitigações: contrato consumido da main, bloqueio fail-closed, testes negativos com exceções por dependência formal, identidade separada, menor privilégio, validação reprodutível dos SHA e controle independente.

Rollback por PR/revert protegido e gates, sem force push, sem reduzir segurança. A reversão de um controlador que bloqueia erroneamente deverá preservar outro mecanismo independente de autorização e rastreabilidade, não produzir bypass irrestrito.

## 7. Gatilhos finais e responsabilidade por implantação

**Auditor:** diagnosticar a missão e emitir parecer. **Orquestrador:** conduzir implementação, sub-PRs e correções. **GitHub:** executar checks/merge protegidos, guardar contrato e evidências. **Titular:** conceder autorizações específicas e cancelar/mudar contrato quando necessário.

A próxima entrega é a **PR de BUILD**, iniciada somente após este PLAN integrar a main. Depois: comprovar check real e required status check no ruleset por identidade autorizada; testar casos negativos no GitHub; instalar e testar monitor/retomada possível; integrar checkpoint; retornar imediatamente à PR #679 sem repetir provas ainda válidas.

**Não declarar a P0-AUD-001 instalada, o Mission Lock efetivo, o watchdog persistente ou a PR #679 certificada por causa desta PR documental.**

# CERTIFICADO P0 — Saneamento administrativo do ContaOS 4.1

**Data de referência:** 14/11/2026  
**Plano canônico:** [PR #670](https://github.com/contaos999999/contaos-hml-control/pull/670), merge `5130c4a1be210f04c0a0cebed543d98f47f0c997`.  
**Protocolo de emissão:** [PR #676](https://github.com/contaos999999/contaos-hml-control/pull/676); **certificado só se torna válido mediante APPROVED da Edivan5002, checks do HEAD final, merge protegido, readback na main e CI push**. Não contar o documento como integração enquanto a PR estiver aberta.  
**Resultado após o protocolo de emissão:** **PASS EXCLUSIVAMENTE NO ESCOPO ADMINISTRATIVO DE SANEAMENTO**, com as exceções de classificação de PRs V1 identificadas abaixo. Não constitui certificação de integração funcional V1, das V2–V5, HML privada ou autorização de PROD.  
**Recibo estruturado:** `docs/frontend/auditorias/P0_SANEAMENTO_CERTIFICADO_GLOBAL_2026-11-14.json`.

## I. Integridade histórica absoluta (P0-LOCK-CERT)

A condição vinculante de aprovação do titular é preservar integralmente certificações já **aprovadas, consolidadas e encerradas**. Conferir **antes e depois** do merge as quatro provas somente-leitura:

| Artefato protegido | Git blob SHA original |
|---|---|
| Manifesto V1 histórica **PASS** (`docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`) | `8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff` |
| Dossiê `P0_V1_CERTIFICACAO_FASE8_2026-11-11.md`, **R-01/R-02/R-03 aceitas** | `7045c0a02243b242835e7ea6817b850287917141` |
| Fase 1 de integração funcional, escopo estático: `integracao-funcional-v1/fase1/CERTIFICADO.md` | `751c5e6d8cb53d56be4f51be3fee3cb0feb34f03` |
| Fase 2 de integração funcional, **52/52 PASS**: `integracao-funcional-v1/fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md` | `e07d66897d39e8d57b9d6507cf97ba03ed01c7f1` |

Estes certificados **não foram reabertos nem reinterpretados**, e permanecem vedados quaisquer retrocessos, merges de certificado concorrente, edição de evidência histórica ou PROD.

## II. Fases do Plano Único P0 e suas decisões

| Fase | Objeto específico do saneamento | Resultado e prova |
|---|---|---|
| 0 | Plano, inventário, LOCK histórico | **PASS**: [#670](https://github.com/contaos999999/contaos-hml-control/pull/670), [#671](https://github.com/contaos999999/contaos-hml-control/pull/671), merges protegidos e readback |
| 1 | Subscriber de Trilha A / #593 | **PASS**: [#593](https://github.com/contaos999999/contaos-hml-control/pull/593) MERGED, workflow pós-merge [43600236041](https://github.com/contaos999999/contaos-hml-control/actions/runs/43600236041) SUCCESS, request histórica não selecionada e auditoria privada SKIPPED |
| 2 | Triagem de #590 e #556 | **PASS_CLASSIFICACAO**: [#673](https://github.com/contaos999999/contaos-hml-control/pull/673) MERGED. Ambas continuam `HOLD_DEPENDENCY_V1` em trilha separada; NÃO foram implementadas nem certificadas |
| 3 | GATE aditivo backend #220 | **PASS**: [#220](https://github.com/contaos999999/develop/pull/220) MERGED, C13 ativa preservada |
| 4 | Controlador read-only backend #219 | **PASS**: [#219](https://github.com/contaos999999/develop/pull/219) MERGED, 23/23 Node tests em blobs idênticos, `dispatch_allowed=false`, nenhum cron/PROD |
| 5 | Destino de mudança opcional #218 | **PASS_DESTINACAO**: [#218](https://github.com/contaos999999/develop/pull/218) CLOSED_NOT_PLANNED sem merge, auditoria independente, hash documental preservado; campo adicional `async_failure_diagnostic.kind` **NÃO implementado** |
| 6 | P0-NR como check obrigatório | **PASS TÉCNICO**: ruleset #26495643 ativo, três checks reais (integração GitHub Actions 15368), prova negativa e positiva por PR #676, sem bypass |
| 7 | Certificação global do saneamento | **PASS SOB PROTOCOLO**: depende de review Edivan5002 do HEAD final, CI requerido no mesmo SHA, merge protegido e readback, certificados intactos e issue #675 encerrada por evidência |

## III. Fase 6: ensaio REAL do required status check

**Ruleset ativo** `26495643` (`ContaOS-Zero-Drift-main`), GET REST após o usuário salvar a regra: mantém **os dois checks antigos** e exige o terceiro `ContaOS P0-NR-001 Integridade e Provas`. O ruleset mantém as políticas de exclusão de branch, non-fast-forward e revisão de PR existentes, sem exclusão/bypass. Todos os contexts apontam para GitHub Actions.

**NEGATIVO proposital (somente branch de teste, sem merge):** HEAD `5121fe9d784e7699dae6b5bca03073eb779cc9f5`. A NR-002 recebeu provisoriamente fingerprint duplicado da NR-001 em `P0_NR_001_LEDGER.json`. Job [43606817378](https://github.com/contaos999999/contaos-hml-control/actions/runs/43606817378) **FAILURE**; logs exibem `NR-002 fingerprint causal ausente/duplicado`, sob `Testes negativos de classes conhecidas e falso resolvido`. GitHub REST PR #676 retornou `mergeable_state=blocked` e o ruleset simultaneamente confirmou que P0-NR era **required**. Zero-Drift estava executando naquele instante; não atribuir o bloqueio exclusivamente ao P0-NR sem observar as demais regras. O experimento comprova que a violação não gerou merge permissivo.

**POSITIVO após restaurar a origem:** HEAD `276401c020112e4de9343bdc1d19bbf338ad5b69`. `P0_NR_001_LEDGER.json` foi restaurado integralmente ao Git blob `d601bc36e625e5d93a044f6d22391695891df199`, **exatamente igual à main**. Job P0-NR [43606933376](https://github.com/contaos999999/contaos-hml-control/actions/runs/43606933376) **SUCCESS**, Zero-Drift [43606933383](https://github.com/contaos999999/contaos-hml-control/actions/runs/43606933383) **SUCCESS**, LOCK [43606933481](https://github.com/contaos999999/contaos-hml-control/actions/runs/43606933481) **SUCCESS**, Teste C administrativo SUCCESS por diff não visual; **Playwright SKIPPED, sem alegar E2E**. GitHub REST retornou `mergeable_state=clean` e três required check-runs concluídos SUCCESS. O diff da PR, após a restauração, já não inclui ledger, apenas documentação do ensaio.

A prova positiva deve também ser renovada no **HEAD final desta PR com o certificado adicionado**. A conta auditor Edivan5002 só poderá aprovar após conferir esse HEAD e seu CI.

## IV. Integridade de código, estado residual e limites

- Frontend antes da PR #676: main `68529272dccf9572e99312c43aa7e6a55f8b02f5`; backend main `1504af465b45afc846458d00e5cb63513fa298ed`. Atualizar HEADs na verificação de encerramento.
- O relatório parcial integrado na [#674](https://github.com/contaos999999/contaos-hml-control/pull/674) permanece intacto como registro histórico de situação anterior ao usuário salvar o ruleset. Este certificado é **novo e append-only**, não reescreve relatório parcial.
- V1 histórica PASS com ressalvas aceitas, Fase 1 e Fase 2 52/52 são independentes da missão. V1 integração interna continua pendente em outra trilha. V2–V5 e GATE PROD seguem sujeitos aos seus próprios planos.
- PRs #590 e #556 permanecem OPEN/HOLD_DEPENDENCY_V1; o saneamento certifica a **classificação administrativa**, não o conteúdo funcional destas PRs.
- Zero alterações de `src/`, Auth, RBAC/RLS, Edge, SQL, Storage, secret, produção e certificados nesta PR.
- A prova do novo check obrigatório não presume ausência futura de reincidência. Ledger NR-001…NR-008 permanece monitorado com zero `RESOLVIDO_COM_PROVA` não comprovado.

## V. Emissão e verificação independente

**NÃO tratar como certificado concluído enquanto o próprio arquivo estiver numa PR aberta.** Para entrar em vigor devem existir cumulativamente: (a) requerido status check P0-NR no ruleset confirmado por API; (b) NEGATIVO FAILURE + blocked, POSITIVO SUCCESS + clean; (c) ledger original idêntico e certificados imutáveis; (d) Zero-Drift, LOCK, Teste C e P0-NR SUCCESS no HEAD **final**; (e) auditoria independente Edivan5002 APPROVED no HEAD final; (f) merge protegido em main e readback deste certificado/JSON; (g) checks de push confirmados; (h) fechamento da issue #675 com recibo detalhado.

O **checkpoint pós-merge** deverá registrar SHA da main, SHA aprovado da PR #676, review, CI, arquivos/objeto Git, ruleset, bloqueio e liberação, e a última etapa concluída; não reabrir qualquer fase histórica ou repetir fases 0–5.

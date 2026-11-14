# ContaOS 4.1 — Auditoria P0 de saneamento: resultado PARCIAL (14/11/2026)

**PLANO APROVADO:** `docs/frontend/planos/P0_PLANO_UNICO_SANEAMENTO_PENDENCIAS_2026-11-14.md`, PR #670 integrada.  
**Objeto:** saneamento de PRs antigas e controles GitHub, exclusivamente fora da auditoria de integração funcional V1 e fora de PROD.  
**Decisão:** `PASS_PARCIAL_COM_IMPEDIMENTOS` para trabalhos verificáveis, **NO-GO para certificado global do saneamento**. Não afirmar que todas as pendências foram encerradas.  
**Rastreabilidade estruturada:** `P0_SANEAMENTO_AUDITORIA_GLOBAL_PARCIAL_2026-11-14.json`.

## Regra P0-LOCK-CERT
O titular condicionou a aprovação do plano à **preservação integral de certificações já aprovadas, consolidadas e encerradas**. Nenhuma das correções desta missão pode reabrir, rebaixar, substituir ou invalidar V1 histórica PASS, as ressalvas R-01/R-02/R-03 aceitas, a Fase 1 estática ou a Fase 2 de navegação 52/52. Nenhum certificado técnico histórico será reexecutado por mera conveniência de limpeza de PR. V1 interna é missão distinta e continua pendente. PROD não autorizada.

## Execuções verificadas
| Fase | Decisão | Evidência |
|---|---|---|
| 0 — Inventário e proteção | PASS | PR #670 PLAN, PR #671 inventário, reviews/CI/merges/readbacks |
| 1 — Workflow Trilha A | PASS | PR #593 merge `f654260cb3e1fd4d04ddcd644257efff15371ff9`; CI push GREEN, subscriber `workflow_run` 43600236041 SUCCESS com R14 não selecionada e private SKIPPED, sem refazer Fase 2 |
| 2 — #590/#556 | PASS **somente da classificação** | PR #673 merge `87c3c586a65f9c089601ea8647089a6ec1becbf6`; #590 e #556 continuam OPEN/HOLD_DEPENDENCY_V1, NÃO MERGED, sem nova certificação |
| 3 — GATE backend #220 | PASS | merge `0f7725be5feb8efa028157a57f7629374366b913`; C13 ativa/technical_subtask preservadas; CI push 43601209253 SUCCESS |
| 4 — Controlador #219 | PASS | merge `1504af465b45afc846458d00e5cb63513fa298ed`; review Edivan5002 #5904711819, CI push 43602633463 SUCCESS; **Node nativo 23/23** em blobs idênticos; dispatch sempre false |
| 5 — Backend #218 | **PASS na triagem e destinação, CLOSED_NOT_PLANNED** | Auditoria independente [decisão 6878700812](https://github.com/contaos999999/develop/pull/218#issuecomment-6878700812); PR fechada **sem merge**. Diagnóstico operacional de segurança já expõe failure_code/protocol_failure/failure_hashes; o campo opcional novo **não foi implementado**. Arquivo protegido mantido no SHA original. |
| 6 — P0-NR ruleset | **HOLD_MFA_SUDO** | Conta `contaos9999` possui admin, mas GitHub solicitou MFA/sudo mode ao salvar; **Unauthorized** sem segundo fator. API independente comprova que ruleset 26495643 continua exigindo somente Zero-Drift + Teste C; P0-NR NÃO é required check. |
| 7 — Auditoria global | **AUDITORIA PARCIAL, NÃO CERTIFICADA** | Fase 5 destinada de forma segura; Fase 6 ainda depende de MFA e testes do ruleset; nenhum certificado global emitido. |

## PRs antigas restantes: preservação sem encerramento artificial

**Frontend #590:** `HOLD_DEPENDENCY_V1`, contém dossiê final V1 concorrente e evidência SYS-03 real, run 43039850705. Não mesclar certificado paralelo nem descartar evidência. Reavaliar só na trilha V1 específica com adendo novo e append-only, sem tocar certificado original.

**Frontend #556:** `HOLD_DEPENDENCY_V1`, proposta V123 em DRAFT, SQL/PostgreSQL não executado. Não executar consultas nem atribuir PASS por mocks V8.

**Backend #218:** PR [#218](https://github.com/contaos999999/develop/pull/218) **CLOSED_NOT_PLANNED, SEM MERGE**, após nova decisão independente [Edivan5002](https://github.com/contaos999999/develop/pull/218#issuecomment-6878700812). O documento de prova protegido continua idêntico: Git blob `9c016a09cbec4eb7d5032b90f4c393b1ee9071f4` no backend `main`. O campo novo `async_failure_diagnostic.kind` era observabilidade opcional, **não entregue**, enquanto `failure_code`, `protocol_failure` e `failure_hashes` já são capturados na versão certificada/operacional; assim não se sacrifica integridade histórica para modificar um harness. As falhas antigas Zero-Drift/Restore continuam registradas como justificativa da decisão, não passam a PASS.

## Fase 6: ação administrativa exata, sem bypass

**Repositório:** `contaos999999/contaos-hml-control`. **Ruleset ativo:** `26495643`, `ContaOS-Zero-Drift-main`.

Required checks existentes, que devem continuar integralmente:
1. `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`
2. `ContaOS Frontend Zero-Drift`

**Adicionar como terceiro:** `ContaOS P0-NR-001 Integridade e Provas`, nome exato do JOB da `.github/workflows/p0-nr001-anti-recurrence.yml`; não confundir com nome do workflow `ContaOS P0-NR-001 Anti-Reincidencia`. Validar integração GitHub Actions correspondente, bloquear merge com FAIL, aceitar GREEN e reler ruleset. A conta `contaos9999` tem permissão admin, e a interface autenticada possibilitou selecionar o terceiro check, mas o GitHub exigiu confirmação MFA em modo sudo para **salvar o ruleset**. A tentativa retornou `Unauthorized`; [auditoria visual do bloqueio](https://agent.tinyfish.ai/runs/cd40476b-02b8-489f-a6df-f488f993faf5). A API REST independente, consultada por duas contas, permaneceu com **somente os dois checks anteriores**. A configuração não foi persistida; nenhum check foi removido. **Próxima condição**: titular concluir MFA pelo próprio GitHub, salvar, conferir readback REST com três checks e provar o bloqueio de PR quando P0-NR falhar. Não entregar código MFA por chat.

## Prova de integridade e versão
HEAD frontend inicial deste relatório `87c3c586a65f9c089601ea8647089a6ec1becbf6`. HEAD backend `1504af465b45afc846458d00e5cb63513fa298ed`. Antes de cada PR de correção, reler HEAD de ambos. O documento parcial **não altera** certificados anteriores, workflows, manifestos, produto, backend, Supabase ou PROD.

Snapshot dos quatro blobs protegidos:
- `P0_ORDEM_POR_VERSAO_4_1.json`: `8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff`.
- `P0_V1_CERTIFICACAO_FASE8_2026-11-11.md`: `7045c0a02243b242835e7ea6817b850287917141`.
- `integracao-funcional-v1/fase1/CERTIFICADO.md`: `751c5e6d8cb53d56be4f51be3fee3cb0feb34f03`.
- `integracao-funcional-v1/fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md`: `e07d66897d39e8d57b9d6507cf97ba03ed01c7f1`.

## Continuidade

**Última etapa comprovada:** Fases 0, 1, 2 (classificação), 3 e 4 integradas e revisadas. Fase 5 encerrada quanto à **destinação da PR antiga** por `CLOSED_NOT_PLANNED`, sem implementar campo adicional nem alterar evidência. Fase 6 `HOLD_MFA_SUDO`; Fase 7 auditada apenas parcialmente, sem certificado global.

**Próximo trabalho objetivo:** após a confirmação MFA do titular, adicionar e salvar o terceiro required check, reler ruleset via REST e testar gate. Depois concluir somente Fases 6–7 com certificado de saneamento separado, **sem repetir Fases 0–5** e sem tocar em V1 funcional consolidada. #218 permanece fechada; eventual extensão diagnóstica precisará de PLAN sucessor. Não declarar trabalho em background ou PROD autorizado.

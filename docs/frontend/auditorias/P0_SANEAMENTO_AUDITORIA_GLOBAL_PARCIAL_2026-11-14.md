# ContaOS 4.1 — Auditoria P0 de saneamento: resultado PARCIAL (14/11/2026)

**PLANO APROVADO:** `docs/frontend/planos/P0_PLANO_UNICO_SANEAMENTO_PENDENCIAS_2026-11-14.md`, PR #670 integrada.  
**Objeto:** saneamento de PRs antigas e controls GitHub, exclusivamente fora da auditoria de integração funcional V1 e fora de PROD.  
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
| 5 — Backend #218 | **HOLD_DEPENDENCY_EVIDENCE** | DRAFT/OPEN; Zero-Drift 42808510215 FAIL por escopo, Restore Isolado 42808510355 FAIL (304/307 PASS; três negativos de SHA protegido) |
| 6 — P0-NR ruleset | **HOLD_ADMIN_AUTH** | ruleset 26495643 exige somente Zero-Drift + Teste C; P0-NR executa como `ContaOS P0-NR-001 Integridade e Provas` e passou no run 43600828508, mas NÃO foi adicionado como required check |
| 7 — Auditoria global | **NO-GO certificado global** | Fases 5/6 não estão concluídas; certificação global não emitida |

## PRs antigas restantes: preservação sem encerramento artificial

**Frontend #590:** `HOLD_DEPENDENCY_V1`, contém dossiê final V1 concorrente e evidência SYS-03 real, run 43039850705. Não mesclar certificado paralelo nem descartar evidência. Reavaliar só na trilha V1 específica com adendo novo e append-only, sem tocar certificado original.

**Frontend #556:** `HOLD_DEPENDENCY_V1`, proposta V123 em DRAFT, SQL/PostgreSQL não executado. Não executar consultas nem atribuir PASS por mocks V8.

**Backend #218:** `HOLD_DEPENDENCY_EVIDENCE`, revisão independente de classificação https://github.com/contaos999999/develop/pull/218#issuecomment-6878428485. A mudança `supabase/tests/p0_crud_global_browser.mjs` altera dependência de documento SHA256 imutável, enquanto está fora da allowlist C13. **Não** atualizar hash antigo para forçar GREEN. Nova execução só mediante PLAN/GATE de artefato sucessor e escopo explícito, ou CLOSED_SUPERSEDED com prova de substituição. Job Chromium SUCCESS anterior não anula CI Zero-Drift/Restore FAIL.

## Fase 6: ação administrativa exata, sem bypass

**Repositório:** `contaos999999/contaos-hml-control`. **Ruleset ativo:** `26495643`, `ContaOS-Zero-Drift-main`.

Required checks existentes, que devem continuar integralmente:
1. `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`
2. `ContaOS Frontend Zero-Drift`

**Adicionar como terceiro:** `ContaOS P0-NR-001 Integridade e Provas`, nome exato do JOB da `.github/workflows/p0-nr001-anti-recurrence.yml`; não confundir com nome do workflow `ContaOS P0-NR-001 Anti-Reincidencia`. Validar integração GitHub Actions correspondente, bloquear merge com FAIL, aceitar GREEN e reler ruleset. A conexão atual permite GET do ruleset, mas não operação autorizada de edição/ADMIN, e a leitura de branch protection clássico retornou 403. Portanto **NÃO** afirmar Fase 6 PASS antes de ação do administrador e readback.

## Prova de integridade e versão
HEAD frontend inicial deste relatório `87c3c586a65f9c089601ea8647089a6ec1becbf6`. HEAD backend `1504af465b45afc846458d00e5cb63513fa298ed`. Antes de cada PR de correção, reler HEAD de ambos. O documento parcial **não altera** certificados anteriores, workflows, manifestos, produto, backend, Supabase ou PROD.

Snapshot dos quatro blobs protegidos:
- `P0_ORDEM_POR_VERSAO_4_1.json`: `8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff`.
- `P0_V1_CERTIFICACAO_FASE8_2026-11-11.md`: `7045c0a02243b242835e7ea6817b850287917141`.
- `integracao-funcional-v1/fase1/CERTIFICADO.md`: `751c5e6d8cb53d56be4f51be3fee3cb0feb34f03`.
- `integracao-funcional-v1/fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md`: `e07d66897d39e8d57b9d6507cf97ba03ed01c7f1`.

## Continuidade

**Última etapa comprovada:** Fases 0, 1, 2 (classificação), 3 e 4 integradas e revisadas; Fase 5 classificada HOLD por causas demonstradas; Fase 6 HOLD administrativo. Fase 7 sem certificado global.

**Próximo trabalho objetivo:** obter terceiro required check por administrador, sem remover checks antigos; em paralelo elaborar PLAN/GATE para #218 com preservação de hash antigo e nova prova. Após superar impedimentos reavaliar exclusivamente Fases 5–7, **sem repetir Fases 0–4** e sem tocar em V1 funcional consolidada. Não declarar trabalho em background ou PROD autorizado.

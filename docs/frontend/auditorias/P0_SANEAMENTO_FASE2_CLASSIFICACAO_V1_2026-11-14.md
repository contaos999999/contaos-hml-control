# ContaOS 4.1 — Saneamento P0, Fase 2 — classificação das PRs #590 e #556

**Data:** 14/11/2026. **Estado:** checkpoint documental sujeito a PR, CI, revisão Edivan5002, merge e readback.  
**Plano pai:** PR #670, merge `5130c4a1be210f04c0a0cebed543d98f47f0c997`. **Fase 0:** PR #671, merge `eda87e58bc9e8996d3b4f8601c27eb9a46681377`. **Fase 1:** PR #593, merge `f654260cb3e1fd4d04ddcd644257efff15371ff9`, Zero-Drift/LOCK/P0-NR SUCCESS, Trilha A `workflow_run` 43600236041 SUCCESS, request histórica não selecionada/private SKIPPED. Checkpoint #593 comentário 6878032597.

## REGRA ABSOLUTA P0-LOCK-CERT

**Proibido desconstruir, reabrir, rebaixar, substituir ou reinterpretar qualquer certificação já aprovada, consolidada e encerrada.** A V1 histórica continua `PASS` com três ressalvas R-01/R-02/R-03 aceitas, sem PROD. Os certificados de integração Fase 1 (escopo estático) e Fase 2 (navegação 52/52) permanecem imutáveis. A auditoria de integração V1 ainda pendente corre em outra trilha e não é executada neste saneamento.

## PR frontend #590 — HOLD_DEPENDENCY_V1

**HEAD original** `277ae3226b53e95c979b646f63253150154086fc`. PR ainda OPEN, diffs: `.github/workflows/phase8-sys03-final.yml`, `P0_V1_CERTIFICACAO_FINAL_2026-11-11.json`, `.md`.

Motivo do HOLD: os dossiês alternativos propõem decisão `CERTIFICADA_V1_COM_3_RESSALVAS`, condicionada a rito que já foi concluído no certificado canônico. Integrar a PR como está criaria versão concorrente, contrariando o veto do titular. Ao mesmo tempo, há informação específica de prova SYS-03: run `43039850705`, job `130588405531` e marcadores de recuperação/autenticação que não estão explicitamente enumerados no dossiê canônico `P0_V1_CERTIFICACAO_FASE8_2026-11-11.md`. **Não descartar essa prova como redundante sem preservação.** A fonte continua acessível pela branch/PR.

Revisão independente Edivan5002 (comentário de classificação sem aprovação de certificado): https://github.com/contaos999999/contaos-hml-control/pull/590#issuecomment-6878046212.  
**Decisão:** `HOLD_DEPENDENCY_V1`. PR permanece OPEN, sem merge, sem fechamento e sem mudança no certificado. Próxima condição de retomada: somente pela trilha V1 específica, em tarefa futura separada, para decidir se a referência SYS-03 deve ser preservada em adendo append-only **sem** alterar o certificado encerrado; nunca exigir nova certificação nem dispensar CI. Nenhuma autorização de novo HML privado ou PROD.

## PR frontend #556 — HOLD_DEPENDENCY_V1

**HEAD original** `6183d3959dfae9ecb23f55d8401a57acb79612dc`, DRAFT. Único arquivo: `docs/frontend/planos/PRIVACY_V123_METADATA_WRAPPER_PROPOSTA_2026-11-10.md`, identificado como `PROPOSTA_REVISAVEL_NAO_EXECUTADA`. O próprio documento informa que SQL/PostgreSQL/HML não foram executados, e que seus ensaios foram mocks JavaScript V8, não prova real. Dependências R19/GATE433 e revisões futuras não devem ser tratadas como concluídas.

Revisão independente Edivan5002: https://github.com/contaos999999/contaos-hml-control/pull/556#issuecomment-6878046984.  
**Decisão:** `HOLD_DEPENDENCY_V1`. Mantém DRAFT, sem merge/fechamento/consulta SQL. Condição de retomada: decisão da trilha V1 própria, sob PLAN, autorização de SQL, revisão de literais e provas corretas, sem converter proposta em certificado funcional.

## Critérios de encerramento do saneamento Fase 2

1. As duas PRs têm decisão explícita vinculada a evidências reais e responsabilidades futuras, **sem alegar que o trabalho funcional dessas PRs foi concluído**.
2. `HOLD_DEPENDENCY_V1` é **classificação administrativa de pendência**, não MERGED, CLOSED_SUPERSEDED, PASS de SQL ou prova de integração V1.
3. Nenhum objeto histórico de certificação, manifesto, estado PASS, ressalva aceita, runner de HML, script de produto, banco, backend, autenticação, RLS ou PROD é alterado. Diff deste checkpoint restrito a documentação nova.
4. CI Zero-Drift/LOCK/P0-NR e Teste C exigido no HEAD; auditoria Edivan5002 APPROVED sobre o documento; merge protegido e readback.
5. Conferir hashes: `P0_ORDEM_POR_VERSAO_4_1.json=8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff`; V1 histórica `7045c0a02243b242835e7ea6817b850287917141`; F1 `751c5e6d8cb53d56be4f51be3fee3cb0feb34f03`; F2 `e07d66897d39e8d57b9d6507cf97ba03ed01c7f1`.
6. A conclusão deste checkpoint autoriza passar à **Fase 3 backend PR #220**, preservando integralmente o estado C13 ativo e sem antecipar a #219. Fases 3–7 não estão certificadas por este registro.

**Regra de continuidade:** executar a Fase 3 sem repetir #593, #670, #671 nem as certificações V1; se houver blocker backend, registrar RCA/PLAN próprio. Proibido PROD.

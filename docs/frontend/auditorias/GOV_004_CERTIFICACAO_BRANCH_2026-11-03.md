# GOV-004 — Certificação das regras da branch main

**Escopo:** GitHub `contaos999999/contaos-hml-control`, somente governança. Não acessar/alterar backend, Supabase HML, PROD, `src/**` ou `types.ts`.

**Critérios:** regras PR e 2 status checks obrigatórios, zero aprovações exigidas, no deletion, no non-fast-forward, no bypass. O teste de CI vermelho será induzido **apenas nesta branch** por um teste `node:test` transitório e depois removido, antes do merge. A mudança final persistente limita-se a este documento e a um comentário técnico no workflow Auto-Lock para acionar o teste limpo via evento de push no merge.

## Auditoria do ruleset
- Endpoint GET `/repos/contaos999999/contaos-hml-control/rulesets/26495643`.
- Nome: `ContaOS-Zero-Drift-main`; enforcement: `active`.
- Target: `~DEFAULT_BRANCH` = `main`; zero condições de exclusão.
- Regras presentes: `deletion`, `non_fast_forward`, `pull_request`, `required_status_checks`.
- Pull request: `required_approving_review_count=0`; code owner `false`; last push approval `false`; require thread resolution `true`.
- Checks: `ContaOS Frontend Zero-Drift`, `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`.
- Bypass: `bypass_actors=[]`; `current_user_can_bypass=never`.
- Proteção legada do endpoint branch protection = `enabled=false` não invalida regras de **repository ruleset ACTIVE**, que são mecanismo separado.

## Matriz de execução GOV-004

| ID | Teste | Resultado | Evidência |
|---|---|---|---|
| T01 | Regras ativas e alvo `main` | PASS — consulta direta | ruleset 26495643 |
| T02 | Tentativa de escrita direta `main` com arquivo documental inofensivo | PASS — 409, rejeitado | `Repository rule violations found; Changes must be made through a pull request; 2 of 2 required status checks are expected` |
| T03 | PR com falha controlada de teste node:test, merge deveria falhar | PENDENTE | executar teste transitório apenas na branch |
| T04 | PR com CI verde e 0 reviews, merge permitido | PENDENTE | realizar apenas após remoção do teste propositalmente falho |
| T05 | Force push bloqueado | CONFIGURADO — regra `non_fast_forward`; não executar rewind destrutivo de `main` | ruleset ativo |
| T06 | Exclusão de `main` bloqueada | CONFIGURADO — regra `deletion`; não tentar apagar `main` | ruleset ativo |
| T07 | Sem bypass de admin/bot | PASS config `bypass_actors=[]` + `current_user_can_bypass=never` | ruleset ativo |
| T08 | Auto-Lock normal com `types.ts` íntegro | PENDENTE evidência de run | trabalho em `main`, nenhum drift induzido |

## Protocolo de segurança
1. Não disparar força/exclusão/rewind na `main` em momento algum.
2. Provocar CI negativo apenas em arquivo de teste JavaScript na branch GOV-004, sem dados sensíveis. Não fazer merge desse commit; registrar bloqueio GitHub.
3. Remover completamente o teste temporário. Confirmar a equivalência do blob de teste à `main`, CI `SUCCESS`, ausência de revisão.
4. Se a mudança de comentário no Auto-Lock for aprovada pelo CI e mesclada, o push à `main` deve acionar `ContaOS Types Auto-Lock`, comprovando caminho sem drift. A criação de PR de reparo por drift verdadeiro **não será induzida na main**.
5. Não classificar os testes estáticos T05/T06 como tentativa destrutiva operacional; a prova é de configuração ativa, não de exclusão/force push real.
6. Não confundir o status de job de Teste C com uma auditoria visual real se log registrar `N/A`.
7. HML real excluído por determinação do titular.

## Estado da certificação
**EM EXECUÇÃO**. Concluir os dados de T03/T04/T08 antes de encerrar a auditoria. Ruleset e fonte podem mudar; os resultados aplicam-se ao SHA, run e momento documentados.

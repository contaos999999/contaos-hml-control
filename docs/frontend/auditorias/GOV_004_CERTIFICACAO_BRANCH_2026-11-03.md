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
| T03 | PR com falha controlada de teste node:test, merge deveria falhar | **PASS — recusado (HTTP 405)** | PR #15, CI negativo run 41763485347; mensagem: 2 required checks not succeeded (1 expected, 1 failing) |
| T04 | PR com CI verde e 0 reviews, merge permitido | **PASS histórico — PR #14**; revalidação no PR #15 após CI | PR #14 merge SHA 31eb0a3e7f0dca0f70420eeeab2ded1b69fcab2d, 0 reviews, CI run 41762284750 SUCCESS |
| T05 | Force push bloqueado | CONFIGURADO — regra `non_fast_forward`; não executar rewind destrutivo de `main` | ruleset ativo |
| T06 | Exclusão de `main` bloqueada | CONFIGURADO — regra `deletion`; não tentar apagar `main` | ruleset ativo |
| T07 | Sem bypass de admin/bot | PASS config `bypass_actors=[]` + `current_user_can_bypass=never` | ruleset ativo |
| T08 | Auto-Lock normal com `types.ts` íntegro | **PASS — execução real sem drift** | run 41762615464 job 126353560829; fixture de detecção/restauro PASS, `types.ts` integro na main; nenhum PR criado |

## Protocolo de segurança
1. Não disparar força/exclusão/rewind na `main` em momento algum.
2. Provocar CI negativo apenas em arquivo de teste JavaScript na branch GOV-004, sem dados sensíveis. Não fazer merge desse commit; registrar bloqueio GitHub.
3. Remover completamente o teste temporário. Confirmar a equivalência do blob de teste à `main`, CI `SUCCESS`, ausência de revisão.
4. Se a mudança de comentário no Auto-Lock for aprovada pelo CI e mesclada, o push à `main` deve acionar `ContaOS Types Auto-Lock`, comprovando caminho sem drift. A criação de PR de reparo por drift verdadeiro **não será induzida na main**.
5. Não classificar os testes estáticos T05/T06 como tentativa destrutiva operacional; a prova é de configuração ativa, não de exclusão/force push real.
6. Não confundir o status de job de Teste C com uma auditoria visual real se log registrar `N/A`.
7. HML real excluído por determinação do titular.

## Estado da certificação
**TESTES T01/T02/T03/T04/T07/T08 COMPROVADOS** conforme links e logs. T05/T06 verificações declarativas do ruleset ACTIVE: os controles existem, mas não houve tentativa real de destruição ou reescrita da `main`. A etapa positiva do PR #15 será registrada no seu histórico após CI e merge. Este documento é a evidência inicial; a ata final pode ser complementada em comentário GitHub sem novo commit na main. Ruleset e fonte podem mudar, portanto resultados aplicam-se ao SHA e momento indicados.

## T03 — Evidência adicional de reprovação real

A falha transitória `GOV-004_NEGATIVE_EXPECTED` foi introduzida em `scripts/context-freshness-gate.test.mjs` apenas na branch `governance/gov-004-branch-protection-audit`, commit `e293bd87f272876b9bf6473debe539453e6b7519`. O CI do PR #15 concluiu `failure` (run `41763485347`), e a tentativa de merge recebeu HTTP 405 com `Repository rule violations found\n2 of 2 required status checks have not succeeded: 1 expected and 1 failing`. Nenhum merge ocorreu. Em commit `f7a44f80b537136c64a1bd1de445c7085d18c311`, o teste negativo foi retirado integralmente; o blob retornou ao SHA original `0fc7cf7a28653f620705b55406152b16da57d43a`.

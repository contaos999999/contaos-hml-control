# PLAN P0 — Fase 6: ensaio seguro de check obrigatório no ruleset

**Data:** 14/11/2026. **Origem:** Plano Único P0 #670, Fases 0–5 já concluídas, auditoria PARCIAL #674 em main. **Escopo:** ensaio isolado de PR, NÃO é certificação funcional V1 nem deploy.

## Critério aprovado e mudança administrativa real

O titular confirmou ter salvo a regra. GitHub REST readback do ruleset **26495643**, `ContaOS-Zero-Drift-main`, mostrou `enforcement=active`, mesmo conjunto anterior e terceiro check:
1. `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`;
2. `ContaOS Frontend Zero-Drift`;
3. `ContaOS P0-NR-001 Integridade e Provas`.
Todos `integration_id=15368` (GitHub Actions), sem mudança nas regras de deletion, non-fast-forward e PR review. É configuração real da main, não interface temporária.

## Teste NEGATIVO exigido (sem tocar main)

1. Criar PR de teste documental nesta branch, sem alterar certificados, workflows, PROD, tipos, auth, RLS ou código de produto.
2. **Somente na branch da PR**, alterar provisoriamente UM fingerprint do ledger `docs/frontend/governanca/P0_NR_001_LEDGER.json` para duplicar outro fingerprint existente, o que deve produzir erro no teste `scripts/p0-nr001-gate.mjs` e status de `ContaOS P0-NR-001 Integridade e Provas` FAILURE.
3. Verificar por GitHub REST os check runs no SHA negativo e o estado da PR impedida de merge pelo ruleset ativo. Nunca mesclar HEAD negativo, ignorar checks ou fazer force-push.
4. Se Zero-Drift também falhar (gate compartilhado), registrar a limitação: o ensaio não isola causalmente o bloqueio P0-NR, mas prova que o check exigido está falhando; o required status context é conferido pelo ruleset ao mesmo tempo.

## Teste POSITIVO exigido (somente depois do negativo)

5. Restaurar integralmente o ledger original na branch, comparando seu **Git blob SHA** ao da main (preexistente `d601bc36e625e5d93a044f6d22391695891df199`); não alterar incidente/fingerprint, `RESOLVIDO_COM_PROVA` ou qualquer recibo.
6. Conferir novo HEAD, CI nativo Zero-Drift, LOCK e P0-NR SUCCESS e Teste C obrigatório; verificar `mergeable_state` da PR, revisão APPROVED distinta do autor antes do merge protegido.
7. Integrar exclusivamente o plano/recibo documental final; readback do merge e execução dos checks de push; reconsultar regras administrativas e os quatro blobs das certificações anteriores.

## Prevenção P0-NR / P0-LOCK-CERT

- A falha intencional ocorre **em branch de teste não integrada**. Não fazer downgrade, reexecução ou edição de certificado V1 PASS, Fase 1 ou Fase 2 52/52.
- Não alterar arquivo de workflow, rule exceptions, bypasses, tokens ou PROD. Nenhuma mudança de app e nenhuma execução HML privada.
- O ensaio só será concluído se a falha e a recuperação forem **comprovadas em dois SHAs distintos** e o ledger restaurado na PR final.
- A Fase 6 só recebe PASS após required checks persistidos e validação real; a Fase 7 certifica somente saneamento de PRs antigas, sem declarar V1-interna funcional.

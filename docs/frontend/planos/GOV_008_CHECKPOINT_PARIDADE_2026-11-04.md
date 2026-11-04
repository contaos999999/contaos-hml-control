# GOV-008 — PLAN documental de encerramento parcial da equivalência Lovable × GitHub

**Data:** 04/11/2026 (Brasília). **Baseline:** frontend main `1d4d3488b801e5a8c30875b8588e7cc80063558a`. Fonte backend normativa `contaos999999/develop` commit `cb65f4980f4eeca6ccd33caf6198a801b7e60328`, sem acesso de escrita.

## PROMPT e necessidade
Após GOV-006/007, atualizar checkpoint para refletir controles confirmados, evidência WCAG escopada e mudança das instruções do projeto Lovable. Não declarar 100% enquanto houver contraste INCOMPLETE, HML A/B não verificado, recuperação Auto-Lock real sem prova e retenção limitada de artefatos.

## PLAN, escopo permitido
Arquivos:
1. `docs/frontend/planos/GOV_008_CHECKPOINT_PARIDADE_2026-11-04.md` (este documento, commit anterior).
2. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` (status final e pendências).
**Proibidos:** `src/**`, `public/**`, `scripts/**`, `.github/**`, `supabase/**`, `backend/**`, `types.ts`, PROD, HML, segredo, pacotes e código Lovable.

## Evidências a registrar
- GOV-006 PR #18 mesclado em `bd832cda02cb2c2d1a7041020909724ae70d62f5`; parecer original com adendo.
- GOV-007 PR #19 mesclado em `1d4d3488b801e5a8c30875b8588e7cc80063558a`. TDD RED `41767892283`, GREEN `41768441317`, CI do HEAD final `41769282629`, artefato `13294825132` retido 90 dias (expira 02/02/2027). 24 scans axe-core, 0 violações confirmadas, **24 INCOMPLETE color-contrast**, 12 nós por combinação; 160 cenários protegidos sem sessão, `NÃO VERIFICADO`.
- Git tree `src` `34f9be40ac4167867b0b89362b00e02557eaa95a`, `public` `7f72da43b4a4fbd669ca1e900a773bc18f89845b`, package.json `6dbe973df8f2fb6c45ef4cf544c99fbbb5141713` e bun.lock `17b4d9861dba2e5edef0bb0933d3ab2d8daffea0` iguais entre SHA Lovable `b8ca8b99...` e base GitHub após GOV-006.
- Lovable Knowledge atualizado em 04/11 para owner `contaos999999`, sem IA BUILD; `latest_commit_sha` Lovable ainda retorna `b8ca8b99...` e não comprova sincronismo de metadados.
- Ruleset `26495643` permanece prova GOV-004; Auto-Lock real sem drift PASS, PR de restauração real NÃO TESTADO.
- Backend HML autenticado fora de escopo, sem dados modificados.
- Evidência original GV002 recuperada e 25/25 SHA256SUMS validados; ZIP digest `06dd5aaa044053ae88dc60f9e84289b6b84089d6c080140e20a051c6d47b52ec`. Cópia de conversa não equivale a arquivo institucional permanente.

## VALIDAÇÃO
Escopo documental: PASS. PRD 4.1 e BRAND-01 preservados: PASS. Zero alterações visuais, funcionais, Supabase/PROD/types: PASS. Testes funcionais TDD N/A, executados e registrados GOV-007. CI desse PLAN antes de atualizar checkpoint: obrigatório. Teste C visual N/A para alteração puramente documental; não contar como PASS novo. Rollback revert via PR, nunca force push. Nenhuma aprovação de review requerida pelo ruleset; aprovação específica de BRAND-01 continua íntegra.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Nenhuma mudança em marca, tokens, telas, rotas, código funcional ou backend. GitHub como fonte, Lovable visualização/sync, sem IA de BUILD. Citar N/A visual documental e manter comprovantes WCAG com limitações, sem atalhos.

# GOV-016 — PLAN para ampliar Teste C à V1-18 (24 superfícies)

Data: 04/11/2026 (Brasília). **Somente governança e auditoria de navegação; backend, frontend funcional e PROD intocados.**

## Fonte de verdade
Frontend `contaos999999/contaos-hml-control`, baseline documental `c4d14d31039d3021e2e61785b0660250c0e1af0f`; BUILD funcional do PROMPT 39 / V1-18 em PR #30 **ainda não integrado neste PLAN**. Executar GOV-016 apenas após PR #30 aprovado, integrado e CI pós-merge conhecido.

Plano funcional PRD/Zero-Drift: `docs/frontend/planos/PROMPT_39_V1_18_PARECER_INTERNO_2026-11-04.md`. Fonte normativa `contaos999999/develop@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`, 25/25 blobs canônicos e catálogo 100/97 preservados. NFR de acessibilidade, rastreabilidade e regressão. Atômicos `000,021,022,023`.

## Diagnóstico
`scripts/testc/visual-audit.mjs` enumera atualmente 23 superfícies (SYS01–ADM01, V101–V117), 4 larguras (1440/1280/768/390) × 2 temas = 184 cenários. A nova rota `/competencias/:id/parecer` (V1-18) precisa entrar no inventário para evitar regressão silenciosa. Sem usuário autenticado no HML, V118 deve ser classificada **NÃO VERIFICADA** quanto à UI privada, nunca PASS real. Este PLAN não cria credenciais, dados ou acesso HML.

## Arquivos exatos do BUILD de governança
1. `scripts/testc/visual-audit.mjs`: adicionar V118 à matriz com URI sintética `/competencias/<UUID>/parecer`, protegida, sem executar ações mutativas.
2. `scripts/testc/visual-audit.test.mjs`: verificar 24×4×2=192 combinações únicas, presença de V118 e sua classificação não autenticada.
3. `.github/workflows/contaos-teste-c-independente.yml`: atualizar rótulo do passo de 23 para 24 superfícies, sem afrouxar verificação, sem secrets e sem alterar retenção.
4. `docs/frontend/GUIA_TESTEC_E_FONTES_2026-11-03.md`: refletir contagem atual 24/192 no guia vivo, preservando evidências históricas e casos sem sessão.
5. `docs/frontend/auditorias/GOV_016_TESTEC_V118_2026-11-04.md` e `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: registrar SHA, PR, checks, artefato, estado, o que permanece NÃO VERIFICADO.

**Proibidos:** `src/**`, `public/**`, `src/integrations/supabase/types.ts`, `supabase/**`, scripts de segurança, configurações de Auth/RLS/Storage/Edge, testes com dados reais, Lovable BUILD, `PROD` e documentação canônica 00–20. Não usar PR GOV para alterar código funcional do PROMPT 39.

## TDD, CI e evidências
- TDD RED: alterar teste para exigir 24 e 192 antes de editar o catálogo, executar teste e registrar falha controlada.
- GREEN: adicionar rota privada V118; exigir total 24 e 192 com unicidade; verificar que `classifyProtected` não transforma rota sem sessão em PASS.
- Executar `node --test scripts/testc/visual-audit.test.mjs`, CI `ContaOS Frontend Zero-Drift`, `Auditoria de navegador independente`, hash/artefatos e Zero-Drift.
- Documentar resultados do Teste C novo por tipo: públicas verificadas, protegidas **NÃO VERIFICADAS**, inclusive V118.
- Não declarar WCAG integral, segurança RLS A/B nem homologação autenticada com dados sintéticos.
- Rollback via novo PR de revert, nunca push direto ou force push.

## Decisão/ordem
**PLAN DOCUMENTAL:** permitir BUILD GOV-016 somente depois de PROMPT 39 merge com CI verde e conferência da versão correta de `main`. Qualquer falha de gate bloqueia o merge, não se reduz escopo para passar.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca ContaOS Brand v1.0, sem alteração visual (impacto visual N/A, justificado por alteração exclusiva na matriz de auditoria). Não redesenhar assets, componentes, tokens ou estilos. As quatro larguras e dois temas permanecem obrigatórios e a nova rota é validada como protegida sem sessão. Preferir GitHub e Node; Lovable apenas visualização, zero IA BUILD; não repetir teste íntegro sem mudança e não omitir TDD, CI, Teste C independente, segurança, RNF ou fidelidade ao PRD.

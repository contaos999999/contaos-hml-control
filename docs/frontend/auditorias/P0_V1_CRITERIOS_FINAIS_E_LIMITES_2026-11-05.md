# P0 V1 — 72 critérios finais normalizados e limites de prova
Data da auditoria: 05/11/2026. Escopo: somente GitHub, nenhum backend, HML, Auth, PROD ou interface alterada.

## Lacuna resolvida de rastreabilidade
A matriz `P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json` já relacionava 45 regulares, 416 critérios históricos 00–38 e 37 atômicos V1/NFR, mas **39,40,41,42,43,75 apareciam com zero critérios**. Foram adicionados 12 itens por prompt, totalizando **72 itens de verificação normalizados**. Agora o total indexado é **488 = 416 históricos + 72 normalizados**.

**Proveniência precisa:** os doze itens são a estrutura do TESTE registrada literalmente no [PROMPT 41](../fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md), aplicada como protocolo de aceitação comum aos seis módulos e confrontada com os dossiês de cada um. **Não são uma transcrição literal específica do manual dos outros cinco prompts.** Não afirmar extração literal que não foi executada. Onde a fonte tem resumo fiel dos testes, ele permanece identificável.

| Regular | Tela V1 | Dossiê de fonte contextual | Teste estático/unidade identificado |
| --- | --- | --- | --- |
| 39 | Parecer interno V1-18 | `docs/frontend/planos/PROMPT_39_V1_18_PARECER_INTERNO_2026-11-04.md` | `src/test/competenciaParecer.test.tsx` |
| 40 | Wizard de apresentação V1-19 | `docs/frontend/planos/PROMPT_40_V1_19_WIZARD_APRESENTACAO_2026-11-04.md` | `src/test/competenciaApresentar.test.tsx` |
| 41 | Apresentação/protocolo V1-20 | `docs/frontend/fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md` | `src/test/competenciaProtocolo.test.tsx` |
| 42 | Histórico do contrato V1-21 | `docs/frontend/auditorias/PROMPT_42_V121_TESTES_2026-11-04.md` | `src/test/historicoContrato.test.tsx` |
| 43 | Importação histórica V1-22 | `docs/frontend/planos/PROMPT_43_V1_22_FONTE_ORIGINAL_VERIFICADA_2026-11-04.md` | `src/test/ingestaoHistorico.test.tsx` |
| 75 | Auditoria V1-23 | `docs/frontend/planos/PROMPT_75_V1_23_TRILHA_AUDITORIA_PLAN_2026-11-04.md` | `src/test/trilhaAuditoria.test.tsx` |

## 12 categorias de aceitação
1. Rota abre; 2. Perfil autorizado; 3. Perfil sem permissão efetivamente negado pelo backend/RLS; 4. Loading/vazio/erro; 5. Ausência de secret na rede; 6. Sem UPDATE direto crítico; 7. Desktop 1440 e 1280; 8. Tablet 768; 9. Mobile 390; 10. Teclado/foco/labels; 11. Console sem log sensível; 12. Security Scan sem Critical novo.

Para cada um dos 72 itens a matriz fixa o caminho da rota, fonte contextual, arquivo de teste e blob SHA do arquivo. Títulos de testes são apenas **indícios** por correspondência temática, não equivalência de cobertura nem `PASS_REAL`. Inspeção de código do frontend, mocks e Teste C público não provam sessão autenticada nem autorização por perfil real.

## Gate automático
- `scripts/p0-v1-traceability-gate.mjs` exige seis vezes 12, índices 1–12, títulos canônicos, origens declaradas, arquivos de testes válidos, hash do arquivo registrado, ausência de certificação indevida, integridade dos 416 históricos e 37 atômicos.
- `scripts/p0-v1-traceability-gate.test.mjs` cobre perturbações para perda, duplicidade, fonte removida, teste inexistente, promoção artificial e contagem incorreta.
- A auditoria CI permanece no `contaos-frontend-zero-drift.yml`. Resultado do CI e merge devem ser anexados por checkpoint separado antes de chamar o gate de integrado.

## Proteção adicional dos arquivos de evidência
No workflow `contaos-v1-evidence-release.yml`, a checagem mensal somente leitura agora valida **três digests canônicos fixados em arquivo versionado**, além de `SHA256SUMS` baixado. Isso detecta substituição simultânea dos ZIPs e do manifesto por valores diferentes, desde que o workflow esteja íntegro e a Release seja acessível. Não é proteção contra comprometimento da própria main nem imutabilidade WORM. A existência do agendamento não prova ainda a primeira execução mensal.

## Situação de certificação
- Rastreabilidade documental: **45/45 regulares indexados, 488 itens rastreados, 37 atômicos V1/transversais indexados**.
- Validação funcional e E2E por critério: **NÃO CONCLUÍDA**. Nenhum status foi promovido para PASS por esta operação.
- Apenas R-01 upload real, R-02 worker real e R-03 isolamento real interusuários permanecem ressalvas formalmente aceitas; **não** estender às faltas de segurança JWT de perfil, SYS-03, WCAG privado ou NFR.
- V2 permanece bloqueada pela prioridade-zero; PROD não tocada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Sem impacto visual, nenhuma modificação da marca BRAND-01, nenhuma mudança em Lovable, Supabase, Auth, PROD ou types congelado. Reversível por PR.

## Evidência de integração efetiva do BUILD

- PLAN [#157](https://github.com/contaos999999/contaos-hml-control/pull/157), CI [42054005968](https://github.com/contaos999999/contaos-hml-control/actions/runs/42054005968) com os dois jobs `SUCCESS`, merge `1bd1314ef8287e0117f1fc5f93d3e6d00b93d61b`.
- BUILD [#158](https://github.com/contaos999999/contaos-hml-control/pull/158), HEAD `69b482748ca0e2f87bc4c47e8893d87171ab5b31`, CI [42055040063](https://github.com/contaos999999/contaos-hml-control/actions/runs/42055040063) com os dois jobs `SUCCESS`, merge `c5893df43d8038ed91a113410e26097507ab1594`.
- Pós-merge na main: [42055439865](https://github.com/contaos999999/contaos-hml-control/actions/runs/42055439865) dois jobs `SUCCESS`; Release workflow [42055439763](https://github.com/contaos999999/contaos-hml-control/actions/runs/42055439763) job arquivamento `SUCCESS`, o job mensal `SKIPPED` por não ser evento de agenda. Não declarar que o SHA fixo foi testado via evento mensal.
- Frontend integrado sem alteração funcional: `c5893df43d8038ed91a113410e26097507ab1594`; backend normativo fonte `3aa4af7a292b80243045e0a426ee6399ba948ff2`.
- Situação: integridade da rastreabilidade verificada por CI e testes de negativos; **não** equivale a aceitação individual do comportamento de 488 itens, teste HML privado ou certificação V1.


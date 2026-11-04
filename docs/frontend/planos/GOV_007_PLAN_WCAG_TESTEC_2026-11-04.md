# GOV-007 — PLAN de teste instrumental WCAG no executor Teste C

**Data:** 04/11/2026 · **Escopo:** apenas auditoria/testes/CI do frontend.
**Baseline:** `contaos999999/contaos-hml-control`, main `bd832cda02cb2c2d1a7041020909724ae70d62f5`.
**Fonte normativa:** `contaos999999/develop`, main `cb65f4980f4eeca6ccd33caf6198a801b7e60328`, sem alteração.
**Origem:** GOV-006 (PR #18), GOV-002 (PR #11), issue #9 e `scripts/testc/visual-audit.mjs`, execução independente `41737621829`.

## A. PROMPT: lacuna reproduzida
O executor Teste C atual roda Playwright nas 23 telas × 4 larguras × 2 temas (184 casos), armazena 24 screenshots públicas/negação, SHA256SUMS e relatório. No entanto, `contrast_measured` está fixo em `NAO_VERIFICADO_EXIGE_AUDITORIA_ESPECIALIZADA` e não há medição instrumental de contraste/labels. O artefato gerado tem retenção de 30 dias. Não há sessão HML autorizada; preservar 152 resultados `NAO_VERIFICADO_SESSAO_REAL` e 8 `NAO_VERIFICADO_DRAWER_SEM_SESSAO`.

## B. PLAN e escopo fechado
Somente os caminhos:
1. `.github/workflows/contaos-teste-c-independente.yml`;
2. `scripts/testc/visual-audit.mjs`;
3. `scripts/testc/visual-audit.test.mjs`;
4. `docs/frontend/GUIA_TESTEC_E_FONTES_2026-11-03.md`;
5. `docs/frontend/auditorias/GOV_007_WCAG_TESTEC_2026-11-04.md` (novo, resultado técnico e limitações);
6. `docs/frontend/planos/GOV_007_PLAN_WCAG_TESTEC_2026-11-04.md` (este PLAN).

**Proibidos:** `src/**`, `public/**`, demais scripts/workflows, `package.json`, `bun.lock`, `types.ts`, `supabase/**`, backend, PROD, Auth, Storage, RLS, segredos, Lovable BUILD, qualquer alteração visual do projeto.

### GOV-007-T1: ferramenta e execução
- Instalar `axe-core@4.14.0` **somente** na pasta `$RUNNER_TEMP/contaos-testc`, junto a `playwright@1.64.1`, sem alterar o app. Definir `CONTAOS_AXE_SOURCE_PATH` para `.../axe-core/axe.min.js`; validar presença do arquivo no runtime; versão pinada para reprodução. A injeção acontece somente na página local do navegador, nunca no backend.
- Nas **páginas públicas efetivamente renderizadas**, executar `axe.run` para regras WCAG A/AA selecionadas, com destaque para `color-contrast`, `label`, atributos ARIA e nomes acessíveis. Registrar `violations` e `incomplete`, IDs de regras, quantidade e seletores redigidos, sem texto de campos/senhas.
- Zero violações automatizadas => apenas `PASS_AUTOMATIZADO_PUBLICO`, **nunca** certificação integral WCAG/teclado/manual; itens `incomplete` permanecem `NAO_VERIFICADO`; scan que falha => `FAIL_PUBLICO`. Para violação real => `FAIL_PUBLICO` com evidências, sem silenciar/desabilitar regra.
- Telas privadas não serão escaneadas sem sessão; conservar seus resultados `NAO_VERIFICADO_SESSAO_REAL`; não criar mock, fixtures de Auth ou usuário fictício.
- Gerar relatório JSON e SHA256SUMS verificáveis e capturas existentes, além de dados de acessibilidade do escopo público.

### GOV-007-T2: preservação de evidências
- Alterar `retention-days: 30` para `retention-days: 90`, sujeito ao limite real da organização. Isto **não é arquivo permanente**. Documentar o requisito de arquivamento externo com acesso restrito antes da expiração. Não criar um arquivo público com dados privados ou embutir imagens binárias em fonte do app.
- O pacote anterior do run `41737621829` foi recuperado em 04/11, 26 arquivos, 25 SHA256SUMS conferidos, ZIP SHA256 `06dd5aaa044053ae88dc60f9e84289b6b84089d6c080140e20a051c6d47b52ec`. Acesso/destino de arquivo durável adicional deve ser autorizado pelo titular; o novo relatório GOV-007 contém apenas checksum e link, não imagens.

## C. TDD e segurança (RED → GREEN)
1. Testes de `publicA11yGate` sobre `violations`, `incomplete`, scan error, sem session; assegurar nenhuma ocorrência de texto confidencial no relatório.
2. Teste unitário exige que o estado do relatório não declare `contrast_measured` global como PASS sem resultados públicos individuais e nunca promova telas privadas.
3. Verificar que o código realmente injeta `axe-core` via arquivo local e a instalação é pinada no workflow.
4. Executar regressão 812/812 (ou contagem atual), lint, TypeScript, build, scope-gate e Zero-Drift.
5. O Teste C independente rodará o navegador no SHA exato do PR. **Se o scan real identificar falha**, manter PR sem merge, registrar resultados, criar PLAN separado para correção visual/BRAND-01 com aprovação exigida, e não alterar o UI dentro deste PR.

## D. Validação do PLAN
| Gate | Status | Prova |
| --- | --- | --- |
| PRD 4.1/Premissas/Arquitetura | PASS escopo | ausência de alteração funcional |
| Fonte 25 documentos/100/97 | PASS documental | SHAs normativos do checkpoint; rechecagem automática CI |
| Menor escopo/allowlist fechada | PASS | 6 arquivos acima |
| BRAND-01 | N/A impacto visual | não altera assets, tokens, rotas ou UI |
| Segurança/privacidade | PASS plano | sem credenciais, uploads, backend, screenshots internas |
| Teste C e WCAG | PASS planejamento | runner Playwright, axe real e resumo de `incomplete` |
| TDD/rollback | PASS planejamento | fixture tests e revert apenas via PR |
| Aprovação de revisão PR | N/A | ruleset requer 0 reviews, mas não substitui aprovação de plano para mudanças BRAND-01 (não aplicável) |

**Decisão:** PLAN tecnicamente VALIDADO somente para publicar em commit separado e executar CI; BUILD apenas após CI do PLAN `SUCCESS`.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
ContaOS Brand v1.0/BRAND-01, sem tocar identidade, componentes, rotas ou Design System. Reutilizar > estender > criar. Impacto visual N/A por auditoria exclusivamente instrumentada. Seguir GitHub como editor, Lovable como visualizador sem IA de BUILD. Não declarar teste C N/A como PASS visual. Teste real A/B, reset de senha, upload e outros recursos autenticados permanecem NÃO VERIFICADOS até autorização separada e identidade controlada.

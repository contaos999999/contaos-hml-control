# GOV-012 — PLAN de medição explicável de contraste WCAG

**Data:** 04/11/2026. **Baseline frontend:** `dc3e261ed902be99261ff0153cdddeb02789256c`. **Fonte backend:** `contaos999999/develop` commit `cb65f4980f4eeca6ccd33caf6198a801b7e60328` (somente leitura).

## PROMPT
No GOV-007, 24/24 cenários públicos foram analisados pelo axe-core@4.14.0, sem violações automáticas, porém com `color-contrast INCOMPLETE` (12 nós por cenário). Sem dados por nó (CSS/alvo/razão do axe), não há como corrigir a pendência nem afirmar PASS. A camada institucional usa variáveis OKLCH, opacidade, grid e glows decorativos que podem causar avaliação inconclusiva; isso deve ser confirmado no navegador de testes real, não presumido.

## PLAN delimitado
Permitir **exclusivamente**:
- `scripts/testc/visual-audit.mjs`;
- `scripts/testc/visual-audit.test.mjs`;
- `docs/frontend/planos/GOV_012_WCAG_CONTRASTE_2026-11-04.md`;
- `docs/frontend/auditorias/GOV_012_WCAG_CONTRASTE_2026-11-04.md`.

Adicionar em `visual-audit.mjs` uma função pura `sanitizeContrastDiagnostics` com filtro de campos permitidos, limites de tamanho/quantidade, sem texto, HTML, email, senha, IDs de usuário ou tokens. Dentro do navegador Playwright, para cada nó `color-contrast` INCOMPLETE, registrar atributos técnicos do alvo: `tagName`, `fontSize`, `fontWeight`, `color`, `opacity`, `backgroundColor`, `backgroundImage` apenas por **indicador booleano de fundo não uniforme**, `reasonCodes` (ids de checks axe), `failureReasons` estáticas e sumário de camadas ancestrais de fundo, sem selectors/pseudoclasses que possam carregar dados do usuário. Não gravar DOM completo, HTML, `outerHTML`, texto, values nem URLs. Relatar por cenário os nós e razões reais da incompletude.

Uma métrica conservadora opcional pode classificar contraste de **pares de cores sólidas e completamente opacas** somente quando a origem foreground/background for determinável sem imagem, gradiente, sobreposição ou alfa. Se não for determinável, conservar `NAO_VERIFICADO_REVISAO_MANUAL`; não inventar proporções, não remover regra ou ignorar `incomplete`. O objetivo deste GOV é eliminar a **incerteza da causa** e fornecer evidência segura para um próximo PLAN BRAND-01 se houver contraste insuficiente. Não editar cores, componentes, tokens, assets, rota, experiência ou marca nesta etapa.

## TDD e CI
1. Em commit posterior ao PLAN CI verde, adicionar autoteste RED de sanitização, limites, preservação de causa de `incomplete`.
2. Implementar script de coleta e sanear; executar GREEN, lint, typecheck, build, 812+ regressão, Zero-Drift, Teste C 4 larguras/2 temas.
3. Inspecionar novo artefato real e registrar resultados; sem evidência por nó, não declarar WCAG PASS. Manter HML autenticado fora do escopo.
4. O CI falhará quando houver violation automatizada real. `incomplete` manterá relatório sem falso PASS. Retenção workflow segue GOV-007.
5. Caso exista contraste realmente abaixo de WCAG, abrir PLAN funcional de BRAND-01 com aprovação específica; sem mudar UI neste PR.

## Gates
PRD 4.1 e BRAND-01 preservados. Zero-Drift: sem app, backend, PROD ou types.ts. Segurança: sem coleta de dados sensíveis. Teste C real no SHA final. Rollback por revert via PR. Plano deve preceder BUILD com CI SUCCESS; PR com zero revisões exigidas pelo ruleset. O resultado diagnóstico não substitui revisão manual completa nem E2E HML.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
GitHub direto, Lovable somente sincronização e visualização; nenhum BUILD na IA Lovable, nenhum arquivo `src/**`, `public/**`, `supabase/**`, `.github/**`, `types.ts` ou dependências alterado. Nenhuma alteração em cores/gradientes/design sem prova e gate próprio BRAND-01. `PASS` somente com evidência, `NÃO VERIFICADO` mantido onde necessário.

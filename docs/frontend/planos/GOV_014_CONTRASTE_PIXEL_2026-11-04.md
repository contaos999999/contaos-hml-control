# GOV-014 — PLAN de medição instrumental de contraste por pixel

**Data:** 04/11/2026. **Baseline:** GitHub frontend `9d7bc8a19cba2cb802143f0a229b11f7b6cffef5`. **Origem:** GOV-012, `41806768058`, 24 incompletudes `color-contrast` por cenário e 120 nós em painel público com gradientes e sobreposições.

## PROMPT
O axe-core WCAG pode marcar `color-contrast` como INCOMPLETE para componentes que usam fundo em camadas. A inspeção técnica GOV-012 identificou gradientes e overlays. O titular exige encerramento definitivo do item 4 sem alterar a marca. Medir o contraste perceptível em cada nó público em navegador real, com evidência e classificação conservadora.

## PLAN técnico, escopo fechado
Permitir exclusivamente:
- `docs/frontend/planos/GOV_014_CONTRASTE_PIXEL_2026-11-04.md` (este PLAN; commit anterior);
- `scripts/testc/visual-audit.mjs`;
- `scripts/testc/visual-audit.test.mjs`;
- `.github/workflows/contaos-teste-c-independente.yml`;
- `docs/frontend/auditorias/GOV_014_MEDICAO_CONTRASTE_2026-11-04.md` (relatório).

Instalar `pngjs@7.0.0` somente na pasta temporária de execução Teste C, junto a Playwright/axe. Sem alteração de dependências do frontend.

Para cada cenário **público**:
1. Após `axe.run`, rotular temporariamente os **nós INCOMPLETE de `color-contrast`** com `data-contaos-probe-N`, coletar rect CSS, cores computadas convertidas via Canvas à sRGB, tamanho/peso de fonte, opacidade efetiva da cadeia de ancestrais e motivos `axe`; **não registrar HTML/texto/valores, dados privados, tokens ou seletores**.
2. Capturar o viewport público em Chromium com e sem as letras desses nós, ocultadas **somente na página isolada do runner**, preservando fundos e layout. Comparar PNGs no mesmo pixel para localizar pixels de letras e medir cor real do **fundo renderizado** por trás delas, incluindo glow, gradiente, backdrop e opacidade.
3. Para cada pixel de glifo confiavelmente diferente, calcular foreground efetivo no CSS (com alpha composto) e razão WCAG 1.4.3 (luminância relativa). Critério AA mínimo 4,5:1 texto normal, 3:1 texto grande (>=24px ou >=18,66px negrito). Considerar apenas pixels com diferença de imagem limiarizada; recusar `PASS` se o par de capturas tiver dimensões divergentes, nós sem suficientes pixels, cor inválida, viewport fora da tela ou resultado inconsistente. Guardar razão mínima e quantidade de pontos; limitar número de nós por cenário e dados coletados.
4. Se qualquer razão mínima for inferior ao mínimo WCAG, `FAIL_PUBLICO` em vez de suprimir problema. Se todos os 120 nós obtiverem medida válida >=mínimo, registrar `PASS_AA_PIXEL_PUBLICO`, mas **não** certificar a WCAG inteira (teclado/leitor de tela/HML continuam pendentes). Se algum caso for inconclusivo, `NAO_VERIFICADO`.
5. Testar a função pura do cálculo RGB/luminância com pares WCAG conhecidos e deteção de falha. Fazer TDD RED/GREEN.

**Proibido:** alterar `src/**`, `public/**`, CSS, tokens, marca BRAND-01, rotas, pacotes/lock do app, `types.ts`, backend Supabase/HML/PROD ou usar IA Lovable para BUILD.

## Gates e rollback
- Executar CI do PLAN antes de TDD/BUILD.
- CI Zero-Drift, testes unitários, regressão, TypeScript, build, Teste C independente em 184 cenários, com artefatos e SHA256SUMS.
- Se teste pixel detectar falha, manter FAIL e planejar correção visual BRAND-01 **separada**, com aprovação específica do responsável, sem mexer no UI nesta etapa.
- Se dado não for suficientemente robusto, manter `INCOMPLETE` sem falso PASS.
- Rollback de scripts via novo PR/revert, nunca force-push.
- Revisões de PR exigidas pelo ruleset 0; não elimina aprovações específicas de UI.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Nenhuma modificação visual. GitHub editor canônico, Lovable apenas sincronização/visualização. Menor alteração possível, sem mudanças de HML ou PROD, sem gasto de IA Lovable. Teste C no SHA exato obrigatório. Relatório de contraste público não equivale a certificação global da aplicação.

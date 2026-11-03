# Saneamento retrospectivo transversal — Prompts 00–38

Base: `bc120e3b6cdb2069ce225d52d23d6eec2d3fa6e5` (árvore `a3adc4b6…`). Plano arquivado em `.lovable/plan/saneamento-retrospectivo-transversal-prompts-00-38-plan-2026-11-03.md`. O PROMPT 38 / V1-17 ficou fora deste trabalho.

## A — Root em PT-BR
- `src/routes/__root.tsx`: `lang="pt-BR"` e textos do 404 e do erro global traduzidos. Classes, tokens, `reset`, `console.error`, `reportLovableError` e head permanecem iguais.
- RED: `src/test/rootLocale.test.tsx` deu 10/10 falhas antes da edição.
- GREEN: 10/10.

## B — Cobertura BRAND-01 das telas V1-08 a V1-16
- `src/test/brand.test.tsx`: lista `ARQUIVOS_V108_V116` (9 telas) e novo bloco de testes com estas exigências:
  - `<ContaOSMarca`;
  - nenhum hex de cor em `className`, `style` ou valor arbitrário `[#…]`;
  - nenhum `<img>` fora de `/brand/`;
  - nenhum CSS próprio ou fonte externa.
- Os detectores têm um teste sintético que prova que eles falham com violações e ignoram hashes/SHA.
- Achado: a regra legada contra o `ShieldCheck` provisório acusou falso positivo em `CompetenciaVisaoGeral.tsx:271`. Ali o ícone é do cartão Análise, e o logo oficial está na linha 118. A regra legada foi mantida só nas 14 telas originais, e nenhum componente foi alterado.
- Os 9 componentes já estavam conformes, por isso não houve RED de produção.

## Evidências
- Focused (root, brand e app-routing): 44/44.
- Suíte serial `--maxWorkers=1`: 27 arquivos, 759/759.
- eslint nos arquivos alterados: OK.
- `tsgo --noEmit`: exit 0.
- Scan de secrets nos arquivos alterados: 0.
- Browser `/rota-inexistente` em 1440/1280/768/390, claro e escuro (8 combinações):
  - `lang=pt-BR`;
  - título "Página não encontrada";
  - o primeiro Tab foca "Ir para o início".
- `types.ts`: blob `8ea7750b…` (a plataforma o regenerou e ele foi restaurado byte a byte).

## Limitações
- Escuro: o app não segue `prefers-color-scheme`, então as capturas "escuro" saíram em tema claro. Modo escuro do 404: NÃO VERIFICADO.
- Erro global: NÃO VERIFICADO no browser (não induzível sem alterar código); coberto por teste de fonte.
- Fluxos autenticados: não exercitados neste saneamento.
- Build manual: gate externo; o build automático da plataforma fica como referência.
- Teste C: pendente, em turno separado.

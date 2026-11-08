# TRILHA A: PLAN mínimo de correção visual Run78

Status: PLAN documental submetido a CI e revisão independente. Exige integração antes do GATE separado e do BUILD. Nenhuma alteração de produto, execução HML ou escrita de negócio neste PR.

## Base e fontes

- Evidência imutável: TesteC78/run42511641527; frontend `241dd775d14a0d2a1ec24c93ae3f655c79d3efd2`; harness `2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33`; HML `dpl_AoNgZRZnutXauuPsfQ2shEmUaULS`; ZIP SHA256 `8dc04bdef43937aea423da1721d1de51137304ded35ed9308cfaaf6da43d7081`.
- Insumos: revisão independente integral dos208PNG originais, dividida entre cadastros112, documentos64 e contratos32; causas e limites transcritos abaixo para rastreabilidade durável.
- Normativos lidos integralmente por `git show FETCH_HEAD`: `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md` e `20_PROMPT_000_BRAND_01.md` em `/tmp/contaos-normas`, FETCH_HEAD `7c8fdb1644058831cc2a7d1bacd931eee18cd997`.
- Checkout de consulta: `/tmp/contaos-fixtures`, branch observada `build/trilha-a-24-fixtures-20261108`, HEAD observado `7038fb10633e738b35a4104aefbb2a3f856843b8`. Isso não substitui o frontend auditado. Antes de futura implementação, fixar base atual, verificar AGENTS/Zero-Drift e isolamento sem misturar fixtures ou trabalho alheio.

## Defeitos comprovados e hipóteses

| ID | Comprovado no Run78 | Causa e confiança | Resultado pretendido |
|---|---|---|---|
| C01 | Oito FAIL color-contrast: V106light nas quatro larguras, dois rótulos/caso; V107light nas quatro, um rótulo/caso | Rótulo interno `text-muted-foreground` substitui foreground do Selo sobre bg-muted; causa localizada | Rótulos Situação/Criticidade herdam foreground existente e deixam de falhar no contraste medido |
| R01 | V101a768 apresenta colisões de cabeçalho/badge; filtros ficam estreitos | md seleciona tabela pelo viewport enquanto sidebar224/80px muda largura útil; percentuais e ajuda44px não cabem. Causa estática sustentada; larguras estimadas não são medições novas | Cards/tabela e filtros respondem ao container real, sem perder semântica ou alvo44px |
| M01 | V110390light/dark Menu fechado cobre seta e direita de Situação | AppShell fixed bottom/right z50 sem espaço no fluxo; causa direta compatível. Não foi demonstrada impossibilidade permanente de operação após scroll/teclado | Acionador no fluxo de cabeçalho móvel com área reservada, sem cobrir campos, metadados ou foco |
| D01 | Indicador calendário pouco perceptível em V105dark e V113dark nas quatro larguras | Fundo autoral dark sem orientação explícita do esquema nativo. Computed color-scheme e razão de contraste não foram medidos | Date/month nativos alinhados ao tema, com indicador visível e valores/restrições preservados |
| B01 | V121390dark_menu sem marca pintada, embora brandCount=1 | Causa produto NÃO demonstrada. Menu monta img condicionalmente; harness captura sem complete/naturalWidth/decode e só conta :visible depois. Corrida decode/pintura plausível, ainda hipótese | Evidência só é produzida após marca válida/decodificada e fence drenada; imagem quebrada falha explicitamente; asset oficial mantido |

Menu aberto sobre conteúdo é diálogo deliberado, não falha por si. Auditoria parcialmente na borda inferior do screenshot requer scroll/teclado no teste futuro, sem inferir inacessibilidade permanente. Aviso estreito V121mobile e locale nativo de datas ficam como observações separadas, sem expansão editorial deste patch.

## Escopo visual e governança BRAND-01

A Brand complementa a Arquitetura4.1; requisitos funcionais, navegação, acessibilidade e responsividade prevalecem sobre estética. Reutilizar Design System, Inter e tokens existentes. `src/styles.css` já centraliza foreground/muted/background/sidebar e variante por `.dark`; nenhum novo token de paleta é necessário. Remover muted apenas nos rótulos afetados, sem modificar a paleta global.

Mapa preservado: sidebar expandida e menu móvel usam horizontal monocromática branca oficial sobre sidebar escura; recolhida usa símbolo branco oficial; variantes de fundo claro do componente existente permanecem. Logo vertical, login, favicon, PWA, manifest, metadata e boot/erro não recebem alterações desta correção. Seu estado histórico permanece com prova própria, sem alegar nova validação. Não redesenhar, inverter, duplicar ou substituir SVG; não alterar proporção, cores ou tipografia da marca.

Supabase, migrations, RLS, grants, RPCs, Edge Functions, Auth, autorização/RBAC, cliente Supabase, env, integrações, rotas, regras, cálculos, estados oficiais, ações e dados ficam fora do escopo. Preservar textos, filtros, formulários, campos e controles existentes. Apenas reposicionar o acionador visual existente, mantendo a mesma navegação e semântica. Nenhuma biblioteca ou Design System paralelo.

## Arquivos exatos previstos para futura alteração

Caminhos relativos à raiz do repositório ContaOS; raiz de consulta atual `/tmp/contaos-fixtures/`.

| Arquivo existente | Alteração mínima permitida |
|---|---|
| `src/components/contratos/VisaoGeralContrato.tsx` | Selo:135–139, retirar muted apenas do span de rótulo; manter valor/estado |
| `src/components/contratos/BaseNormativaContrato.tsx` | Fonte:279, retirar muted apenas de Situação interna ao Selo |
| `src/components/contratantes/ListaContratantes.tsx` | Container local e seleção complementar cards/tabela por largura útil; filtros responsivos locais |
| `src/components/layout/ContaOSAppShell.tsx` | Substituir posicionamento flutuante:199–213 por faixa móvel no fluxo com espaço reservado; preservar dialog/foco/inert/Escape e links |
| `src/components/contratos/NovoContrato.tsx` | Dois input type=date:467/474 recebem classe local de aparência nativa, preservando required/min/valor |
| `src/components/contratos/NovaCompetencia.tsx` | Input type=month:377 recebe a mesma classe local de aparência nativa |
| `src/styles.css` | Somente classe escopada para date/month acima, `color-scheme:light` e `.dark`→dark; sem regra global para todos controles |
| `scripts/hml/authenticated-visual-audit.mjs` | Barreira marca APÓS abrir menu e ANTES de screenshot; medições antes da captura; drain/assert da fence; erro explícito de imagem |
| `scripts/hml/authenticated-visual-audit.test.mjs` | Casos asset retardado, incompleto/quebrado/decode rejeitado e ordem da barreira |
| `src/test/contratoDetalhe.test.tsx` | Regressão de conteúdo/semântica dos selos; contraste real coberto por navegador |
| `src/test/baseNormativa.test.tsx` | Regressão semântica do Selo e estado |
| `src/test/contratantes.test.tsx` | Preservar lista/filtros/editar nos estados existentes |
| `src/test/appShellSidebar.test.tsx` | Mesmos rótulos, foco, diálogo, Escape, retorno e estados administrativos |
| `src/test/visualShell.test.tsx` | Regressão visual estrutural do acionador móvel sem checks que espelhem só classes |
| `src/test/novoContrato.test.tsx` | Preservar entrada ISO, required e min dos dois dates |
| `src/test/novaCompetencia.test.tsx` | Preservar mês/ano e formulário existente |

Arquivos novos propostos, sujeitos à revisão do PLAN: `docs/frontend/planos/TRILHA_A_VISUAL_RUN78_PLAN_2026-11-08.md` para integrar este plano; `docs/frontend/planos/TRILHA_A_VISUAL_RUN78_GATE_2026-11-08.md` para GATE separado posterior; `scripts/testc/visual-run78-regression.mjs` e `scripts/testc/visual-run78-regression.test.mjs` para verificações reais de largura/interseção/tema no teste isolado, reaproveitando ferramentas existentes. Não acrescentar workflow, dependência ou arquivo de produto fora desta lista sem revisão explícita de escopo. Arquivo futuro de resultado deve ser nomeado no GATE, antes da execução.

Nenhum arquivo `public/brand/`, favicon, PWA/manifest, metadata, login ou backend deve entrar no diff. A preservação de assets pode ser verificada por diff/hash.

## Desenho mínimo

1. C01: herdar `text-foreground` já definido no Selo. Não alterar `.text-muted-foreground` global, tokens ou demais textos secundários. Validar rótulo+valor real nos oito casos que falharam.
2. R01: container local da lista determina representação única. Limiar inicial proposto56rem de conteúdo útil, a confirmar na borda real; não confundir com viewport896px. Usar mesmo limiar complementar para ocultar tabela/exibir cards sem duplicação acessível. Filtros empilham pela largura disponível antes de comprimir busca. Não mascarar com overflow hidden, reduzir fonte, truncar sem alternativa ou reduzir tooltip44px.
3. M01: faixa móvel no fluxo, acima do conteúdo, reservando altura real e mantendo acionador persistente como elemento normal; preferir fluxo sem sticky neste patch para eliminar nova obstrução de foco. Não mover a organização nem redesenhar header; usar tokens existentes. Diálogo continua fixed/scrollável, com corpo inert e foco contido; preservar fechamento por navegação e retorno de foco.
4. D01: classe escopada aplicada somente aos três controles nativos V105/V113, orientada por `.dark`, inclusive quando SO prefere tema oposto. Sem filtro invert global, datepicker customizado ou promessa de formato visual por locale. Preservar controles, required/min e negócio.
5. B01: após abrir diálogo, exigir uma img de marca no diálogo; esperar `complete && naturalWidth>0`, `decode()` concluído dentro de timeout e dimensões positivas. Drenar/assert fence após montagem/carregamento; aguardar dois RAF; coletar src/dimensões/estado ANTES do PNG. Em falha registrar código diagnóstico limitado e falhar caso, sem fabricar PASS por contagem. Não mudar asset nem política de privacidade/rede. `decode()`/contagem não substituem revisão visual do PNG.

## Sequência obrigatória: PLAN → GATE → RED → BUILD → GREEN → Teste C

1. Integrar somente PLAN documental em PR; CI documental/repositório, revisão independente e merge verificáveis. Registrar PR, HEAD, merge SHA e checks. Este rascunho não satisfaz esse passo.
2. Depois, elaborar GATE em PR separado referenciando PLAN integrado, com base exata, arquivo allowlist final, ambiente isolado, comandos, dados sintéticos, limites e identidade de prova publicada. CI, revisão e merge do GATE antes de iniciar implementação/execução. Nenhuma execução HML por este documento.
3. RED: produzir regressões significativas que detectem os defeitos nos SRC anteriores, em ambiente local/isolado. Registrar SHA e falha esperada por defeito. Teste de classe isolada não prova colisão, cor ou pintura.
4. BUILD: implementar apenas escopo aprovado em branch isolada. Registrar commit e diff; não alterar testes para esconder RED. CI/revisão independentes antes de merge de produto/harness.
5. GREEN: rodar testes focados e verificações reais do GATE, lint, TypeScript, build, regressão existente, BRAND/security/Zero-Drift exigidos pelo repositório. Registrar logs/run e SHAs. Não há script npm typecheck no package consultado; usar `npx tsc --noEmit`/comando canônico de CI confirmado no GATE. `npm run lint`, `npm test`, `npm run build`, `node --test scripts/hml/authenticated-visual-audit.test.mjs` são candidatos a fixar no GATE, não comandos executados aqui.
6. Teste C somente após GREEN e gates de publicação/origem/sessão/privacidade vigentes. Fixar frontend/harness/deploy exatos e conferir grafo/artefatos publicados. Fase TESTE é read-only: nenhuma correção de SRC, gravação de negócio ou reconstrução de screenshot nessa fase. Falha retorna a BUILD com novo ciclo/prova.

## Matriz mínima a detalhar no GATE

| Alvo | RED e aceitação GREEN/Teste C |
|---|---|
| C01 | Axe e razão real foreground/background nos V106/V107light quatro larguras; confirmar eliminação dos nós apontados e regressão dark. Zero violações não resolve incomplete |
| R01 | 1440/1280/1024/768/390 light/dark, sidebar aberta/recolhida; 767/768/769 e limiar útil−1/igual/+1. Medir container real, uma representação acessível, sem interseção entre cabeçalhos/badges/colunas. Nome/CNPJ longo, ausência de fantasia/documento, inativo, data longa sintéticos. Ajuda44px/foco/editar/filtros operáveis, zoom200%, sem scroll horizontal da página |
| M01 | V110390light/dark com Situação, scroll do início ao fim e alturas menores que1000; outros mobile afetados V106/V107/V121. Retângulos e `elementFromPoint` em centro/bordas/seta de campos e controles focados, além de PNG. Abrir/fechar/Escape, Tab/Shift+Tab, foco contido e retorno, scroll até Auditoria; regressão desktop768/1280/1440 |
| D01 | V105/V1131440/1280/768/390 light/dark; computed color-scheme conforme classe mesmo com SO oposto. Ícone pintado sem corte; mudar tema preserva valor, entrada/seleção nativa, ISO/required/min. Chromium auditado; outros motores somente se declarados suportados |
| B01 | Testes de imagem retardada e quebrada/rejeitada falham/esperam corretamente. V121390light/dark rede fria/quente, repetições delimitadas e diagnóstico anterior ao PNG. Se defeito persistir com decode completo, investigar produto antes de alterar asset/CSS. Validar principal+suplemento em cada largura para marca horizontal/símbolo e navegação |

Reutilizar ainda `src/test/brand.test.tsx`, `src/test/sidebarRouter.test.tsx`, `src/test/documentosContrato.test.tsx` e `src/test/historicoContrato.test.tsx` como regressão, sem necessidade presumida de editá-los. Capturas originais, não composição. Teste DOM não substitui renderização; overflowX=0 não exclui colisão interna; contraste da imagem não equivale a medição integral WCAG.

## Preservação, saída e limites

Preservar Run78 e SHA256SUMS sem substituir arquivos. Novos resultados devem ter run/commit/deploy/harness e hashes próprios. Oito FAIL permanecem FAIL históricos; 96 PASS_AUTOMATIZADO mantêm natureza parcial e defeitos/limites visuais registrados. Os24 baseline históricos ficam com seus SHAs e status de origem, sem declarar recaptura. As18 provas públicas históricas mantêm identidade/resultado próprios: não declarar repetição nem somar como cobertura privada desta rodada. Bloqueios56PII e24fixture permanecem bloqueios até prova específica, sem liberar captura de conteúdo desconhecido para preencher contagem.

Atualização posterior do checkpoint oficial deve listar PLAN/GATE PRs, HEADs, commits, CI, RED/GREEN/TesteC, ZIP/hashes, revisão e pendências. Não declarar checkpoint integrado sem consulta ao GitHub. Este PR integra planejamento, sem declarar BUILD ou Teste C executados.

Os72 itens normativos exigem avaliação individual com evidência adequada; quantidade de PASS, quantidade de axe incomplete ou esta correção focal não certifica72, WCAG integral ou V1. Não declarar BRAND-01 final PASS enquanto gate crítico falhar ou faltar prova. Se qualquer mudança exigir comportamento de negócio, backend, arquitetura ou arquivo fora do escopo, registrar lacuna/conflito e revisar o plano antes de ampliar.

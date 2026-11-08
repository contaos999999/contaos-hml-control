# TRILHA A: BUILD visual Run78, recibo local RED/GREEN

Estado: candidato local de BUILD para revisão independente e publicação pelo coordenador. Não comitado, não integrado e sem Teste C HML. Base limpa inicial `4190a0a4b7acd34a393ae62ea8010cec1dfdce7a`, branch `build/trilha-a-visual-run78-20261108`, worktree `/tmp/contaos-visual78-build`. PLAN369/GATE371 integrados conforme coordenação; GATE371 é a allowlist deste delta. Nenhuma credencial, sessão HML ou preparação de fixture foi usada.

## Alterações do produto

- C01: apenas os rótulos internos dos selos V106/V107 herdam foreground do selo. Tokens, valores, estados e demais textos muted preservados.
- R01: seção da lista usa container nomeado; cards/tabela têm condições complementares em56rem de largura útil. Colunas26/16/17/11/16/14% reservam espaço ao rótulo e ajuda44px da Situação. Filtros usam container próprio com limiar48rem e busca minmax(0,1fr). Limiar inicial do GATE, ainda sujeito à medição real de borda. Build CSS gerou @container lista(width>=56rem), @container filtros(width>=48rem) e as duas regras nativas scoped.
- M01: faixa Menu no fluxo após o cabeçalho da organização e antes do conteúdo; sem fixed/sticky. Modal/foco/Escape/inert/administração/rotas preservados. Teste novo observou RED na ordem antiga (header não precedia Menu); após mudança, mesma expectativa passa.
- D01: classe `contaos-date-field` somente nos dois dates V105 e month V113, com color-scheme light e `.dark` dark. Sem alteração de required/min/valores/handlers/locale.

## Auditor

Barreira causal única de captura: marca contextual pronta/decodificada → drain/assert fence → dois RAF → métricas reais → privacidade integral → PNG. Contexto da marca é fechado em superfície/largura/tema/modo; SRC deve continuar igual após decode. SYS04 usa os quatro assets oficiais conforme aplicação existente (navy em dark no fundo claro do header, símbolo abaixo de640). Sidebars/menus usam somente versão branca apropriada, sem aceitar navy ou outro SVG. Nenhum asset foi alterado.

Coletores devolvem somente números/booleans/enums/IDs estáticos de campo: caixas, pontos de hit-test, largura útil, clipping de células, esquema computado dos3campos e razão sRGB dos rótulos conhecidos. Não exportam labels/valores arbitrários ou mensagem de erro do browser. Controles legitimamente `:disabled` (incluindo fieldset) ou aria-disabled em controle semântico dispensam SOMENTE hit-test; continuam submetidos à geometria/clipping. Controles ativos cobertos falham. Não inferir pintura de calendário a partir de text color.

Recibo focal exige identidade de caso/rota, viewport/tema, contexto da marca, métricas anteriores ao PNG, arquivos DOM/PNG e hashes. Falha de privacidade revalidada mantém BLOQUEADO_PII e remove todos os artefatos do caso; erro visual usa código fechado. Classificador original, catálogo de texto, Auth, cerca, endpoints e política padrão somente leitura não foram ampliados.

Seleção focal testável74casos e seis baseline móveis V114/V116/V118390 recapturáveis; demais18baseline mantêm origem/status. Os24registros antigos não são reescritos. As18provas públicas permanecem independentes e não foram repetidas.

Native guard preserva os oito testes causais e sua atestação8/8; depois deles exige, em processo separado e sem credenciais, um teste Chromium isolado de SVG oficial retardado/quebrado/duplicado e hit-test ativo/desabilitado. Essa prova adicional não é o nono teste causal e não substitui nenhum dos oito. CI deve executá-la com Chromium1208 congelado. Log fechado do guard informa visualCases=1 somente após sucesso real.

## RED e resultados locais

RED produto histórico: os21casos e63hashes permanecem no GATE371 e em `docs/frontend/auditorias/evidencias/visual-run78-20261108/red-evidence.json`, Run42511641527. Nenhum FAIL antigo foi reclassificado. Novos testes foram escritos e observados falhando antes dos respectivos helpers/guardas: ausência de helpers, ordem shell, campos de recibo/identidade, troca de SRC, contexto SYS04 e hit-test disabled. O teste adicional de foco contém/restaura foco e preserva conteúdo; não reivindica geometria por JSDOM.

| Verificação                                                   | Resultado real                                                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Vitest focado11arquivos, antes da regressão adicional de foco | 309PASS                                                                                                                            |
| Shell final2arquivos                                          | 41PASS                                                                                                                             |
| Regressão completa Vitest                                     | 1167PASS em42arquivos, zero FAIL                                                                                                   |
| Node harness final                                            | 207PASS, zero FAIL,9SKIP (8nativos +1novo browser; não são PASS)                                                                   |
| TypeScript --noEmit                                           | exit0                                                                                                                              |
| Vite build                                                    | exit0; nenhuma árvore de rota gerada alterada                                                                                      |
| ESLint somente allowlist                                      | exit0,0erros,1warning preexistente do ref no cleanup AppShell:93                                                                   |
| Prettier11arquivos alterados                                  | exit0                                                                                                                              |
| git diff --check                                              | exit0                                                                                                                              |
| LOCK-TYPES                                                    | 8ea7750b75fd9d76b29c36ce7613392e3ab65e19, preservado                                                                               |
| lint global                                                   | FAIL:10257erros/11warnings fora da allowlist (inclui parsing em tests/hml/sys03-real-e2e.spec.ts:42); nenhum reparo fora de escopo |
| --native-guard local                                          | BLOCKED HARNESS_SHA: árvore não comitada por instrução; não contornado                                                             |
| Novo teste Chromium direto, env nativo1                       | FAIL de ambiente: Chromium headless-shell1208 ausente; prova não executada                                                         |

Bun não está no PATH deste executor. Dependências foram fornecidas pelo node_modules compartilhado já congelado; nenhuma instalação/lock foi alterada. Comandos equivalentes executados com binários locais: `./node_modules/.bin/vitest run [arquivos]`, `node --test scripts/hml/authenticated-visual-audit.test.mjs`, `./node_modules/.bin/eslint [allowlist]`, `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/vite build`, `./node_modules/.bin/prettier --check [allowlist]`. CI continua obrigada a executar os comandos Bun do GATE, frozen install, checks canônicos e os8nativos+prova adicional no HEAD publicado. Não mudar guard/skip por limitação local.

A tentativa diagnóstica separada de lançar Chromium156 do sistema com sandboxtrue também foi bloqueada pelo executor (socket Operation not permitted); não se desativou sandbox e não se usou esse motor como substituto do1208. Os logs de falha de ambiente não são prova de defeito do produto nem GREEN de browser.

Prettier foi aplicado exclusivamente aos arquivos allowlisted modificados; alguns TSX anteriores eram compactados e o formatter ampliou o diff textual. Alterações semânticas estão listadas acima. Não formatar outros caminhos para resolver o lint global.

## Logs locais e integridade

Os caminhos abaixo são arquivos locais de execução, ainda não prova de publicação ou artefato durável de CI. SHA256 permite ao coordenador conferir os insumos antes de anexar evidência saneada. Nenhum log foi capturado de sessão HML/Auth.

| Etapa                         | Log local                                | SHA256                                                             |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| RED helpers                   | `/tmp/visual78-red-harness.log`          | `d6013fd0586bad385c1b6dcb74f07e8283f934be1743325ec256720ac2be0a5c` |
| RED ordem shell               | `/tmp/visual78-red-shell.log`            | `5f1ab813d9bd3049bb06cb188ae6fe7650f4ca2a76f2170d09ee6a8cb117bbf3` |
| RED proveniência              | `/tmp/visual78-red-provenance.log`       | `3f1d2a027b261d1ec1f9fecef70f287f6be8e80c46448e338b12c4f49702ed70` |
| RED src muda durante decode   | `/tmp/visual78-red-src-race.log`         | `983fc23e2f8cb3b042b38e7c3c405c0f43503f898694f12436c18a67850aef5b` |
| RED viewport/tema             | `/tmp/visual78-red-identity-metric.log`  | `4f4f19070ba8a0cddc71e880c9f4cb00c97e5dae46216455f6d21260c0eb2d0d` |
| RED SYS04/disabled            | `/tmp/visual78-red-context-disabled.log` | `919940d59dca3272a578509d85c53712c3e9e7a4ff06f2ca415e1583b363c308` |
| RED contexto recibo           | `/tmp/visual78-red-receipt-context.log`  | `2d7dc3b62ec9e13f394039d2e867c84aed3da11b3ed9ea8ba3782b5ea5da6759` |
| GREEN regressão completa      | `/tmp/visual78-vitest-full.log`          | `0ecec5dd0e17e46653f26be27d249af9027542ea54bc412716ef9c70a5c6e058` |
| GREEN harness final           | `/tmp/visual78-harness-final.log`        | `75a5efde704803931bf4cd12447c6f2957332acf500ccd419362d506fa0f1272` |
| GREEN TypeScript              | `/tmp/visual78-tsc-final.log`            | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| GREEN build                   | `/tmp/visual78-build.log`                | `33ee5fdc76d814c906a3339bea039c8d1728ad29ae72887cbc2c0846ebdee88f` |
| GREEN lint allowlist          | `/tmp/visual78-lint-scoped.log`          | `15419a8a6d9692cfbaa667814549f6d531dea50f24881f1c4e3ce5cef3be2961` |
| GREEN prettier allowlist      | `/tmp/visual78-prettier-check.log`       | `17aa973d3f004560237d9a95171210b0671deff23d61628eecf7322ff5938f20` |
| BLOCKED native guard CLI      | `/tmp/visual78-native.log`               | `a8df6ea05f3082f63314e7bdb2ca7ab675b1bd65ce41e5f8f62856b9430f1ca8` |
| BLOCKED browser 1208 isolado  | `/tmp/visual78-browser-blocked.log`      | `efe2eace9829c36c40e91c9445612351b7e1a39b79b3be8fb3d5b8a82bdc84f6` |
| FAIL lint global preexistente | `/tmp/visual78-lint.log`                 | `fabbe44380925ad07231b8c316f319cb9991561111e1bd38493721d48530c6f9` |

## Pendências e próxima etapa

Revisão independente do diff e integração com alterações concorrentes dos dois mjs do preparador/privacy, sem revertê-las. Depois publicação/CI no HEAD exato, oito provas nativas e prova de browser adicional. Só então Teste C read-only, 74casos focais e revisões originais, mais ensaios adicionais exigidos no GATE: larguras úteis56rem±1/1024/767/768/769/zoom200, rolagem/alturas640/1000 e foco, tema do SO oposto e campos nativos, marca em rede fria/quente. Esses ensaios de produto não foram executados localmente nem HML; o coletor fornece medições do estado atual e não afirma cobertura de scroll/zoom por si.

A ausência de marca Run78 continua defeito do artefato com hipótese de corrida; decode não certifica pintura. Oito FAIL de contraste permanecem históricos até nova prova. Não declarar correções homologadas, fechar issue350, BRAND final,72critérios, WCAG integral ou V1. Nenhum backend, dado, Auth, RLS, tipo, lock, workflow, preparador, asset ou rota alterado.

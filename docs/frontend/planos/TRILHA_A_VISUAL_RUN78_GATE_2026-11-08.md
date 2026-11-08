# GATE documental: correção visual Run78 da Trilha A

Status: proposta de GATE para PR exclusivamente documental. PLAN #369 integrado em `87a99daaf3746baed09c5ae41ef116c591d54506`, com CI `42515269407` e `42515269339` e revisão independente de review_plan, conforme comprovação recebida do coordenador. PR https://github.com/contaos999999/contaos-hml-control/pull/369; checks https://github.com/contaos999999/contaos-hml-control/actions/runs/42515269407 e https://github.com/contaos999999/contaos-hml-control/actions/runs/42515269339 confirmados SUCCESS noHEAD30e26c71b2b3dbac508c656b972d9d7c83591599. Base deste GATE: main daf71df6864b7186c3e95c4b55c26f0a3c274ac4, que inclui370; backend7c8fdb1644058831cc2a7d1bacd931eee18cd997 com snapshot/PLAN coerentes. CI, revisão independente e merge deste GATE são obrigatórios ANTES de RED executável, alteração SRC/harness ou nova execução HML deste ciclo. Este arquivo não declara essas etapas realizadas.

## 1. Identidade, isolamento e separação do preparador

Referência: issue #317, achados visuais de seguimento issue #350 e PLAN `docs/frontend/planos/TRILHA_A_VISUAL_RUN78_PLAN_2026-11-08.md`. Base histórica: TesteC78/run42511641527, frontend `241dd775d14a0d2a1ec24c93ae3f655c79d3efd2`, harness `2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33`, deployment `dpl_AoNgZRZnutXauuPsfQ2shEmUaULS`, ZIP SHA256 `8dc04bdef43937aea423da1721d1de51137304ded35ed9308cfaaf6da43d7081`, report SHA256 `42706b22271ba27fe4c92cc0a0eee415e44319c01a7a05f94ed84634f20dcb3a`.

Usar branch/check-out isolado da main após merge do GATE; registrar HEAD completo, árvore limpa e AGENTS aplicável. Não usar como base silenciosa a branch de preparação de fixtures. A main pode receber mudanças concorrentes do preparador: verificar conflito e ordem de integração dos dois mjs compartilhados, sem reverter política injetada, provas nativas ou isolamento. Este GATE não autoriza editar preparador, workflow, credencial, backend, dados ou regras. Não executar preparação de fixtures para produzir GREEN visual.

Somente HML oficial `https://contaos-41-hml.vercel.app` e API `https://gklhhhyosgasnyoxlrui.supabase.co`; contexto sintético e capacidades do auditor existente. Nenhuma mutação de negócio nesta fase. Login normal e secrets somente no job existente, concorrência autenticada compartilhada, sandbox Chromium e proveniência/CSP/TLS/fence/proxy/privacidade íntegros. Auditor continua sem coletar resposta Auth de sucesso, token, storage ou cookies. Não mudar allowlist de rede, bypass, retries ou política padrão somente leitura.

## 2. Allowlist mínima fechada de BUILD futuro

Não criar os dois scripts/testc opcionais do PLAN: helpers e testes ficam nos dois mjs existentes. Não criar workflow, dependência, script npm, tipo ou arquivo de produto novo.

| Arquivo existente autorizado | Mudança permitida, exclusivamente |
|---|---|
| `src/components/contratos/VisaoGeralContrato.tsx` | Selo, referência auditada135–139: retirar `text-muted-foreground` somente do span dos rótulos Situação/Criticidade para herdar foreground existente. |
| `src/components/contratos/BaseNormativaContrato.tsx` | Referência auditada279: retirar muted somente do rótulo Situação interno ao Selo. |
| `src/components/contratantes/ListaContratantes.tsx` | Referências79–117/288/300/346: container CSS local para cards/tabela com condições complementares; filtros por espaço útil. Não alterar queries, dados, filtros, textos ou rotas. |
| `src/components/layout/ContaOSAppShell.tsx` | Referência199–213: acionador Menu móvel no fluxo, em faixa própria antes do conteúdo, sem fixed/sticky; manter organização, links, diálogo, foco, inert, Escape e capacidades. Desktop preservado. |
| `src/components/contratos/NovoContrato.tsx` | Aplicar classe local de esquema nativo APENAS a `#v105-inicio` e `#v105-fim`, ambos type=date, referências467/474. |
| `src/components/contratos/NovaCompetencia.tsx` | Aplicar mesma classe APENAS a `#v113-mes`, type=month, referência377. |
| `src/styles.css` | Definir uma classe escopada de date/month com color-scheme light e dark sob `.dark`. Sem regra global de color-scheme, filtro invert ou mudança de tokens. |
| `src/test/appShellSidebar.test.tsx` | Acrescentar regressão comportamental se ausente: abrir/fechar, Escape, retorno/containment de foco e navegação, preservando papéis e capacidades. Não afirmar geometria por JSDOM. |
| `src/test/visualShell.test.tsx` | Acrescentar somente regressão de semântica/ordem do acionador no shell e preservação da organização/conteúdo; sem teste que apenas replique classes CSS. Geometria fica no navegador. |
| `scripts/hml/authenticated-visual-audit.mjs` | Helpers somente leitura para medidas reais focais; barreira de marca após montagem e antes PNG; resultado de medição anterior ao PNG; seleção de casos/proveniência testável para seis baseline móveis afetados. Manter interface `--audit` e fluxo/workflow existentes. |
| `scripts/hml/authenticated-visual-audit.test.mjs` | RED/GREEN de ordem causal da barreira, timeout/decode, guards de imagem, seleção/proveniência, coleta de métricas e rejeição de evidência incompleta. Reutilizar Chromium já instalado para prova real isolada quando necessária. |

Linhas acima são referências ao estado auditado, não offsets garantidos na main futura. Antes de editar, reconciliar os símbolos e confirmar diff mínimo. Nenhum `public/brand`, favicon, manifest/PWA, login, metadata, Supabase, RPC, schema, RLS, grant, env, integração, rota, cálculo, estado ou permissão entra no diff. Não mudar assets oficiais, Inter, proporções ou paleta. Os demais testes existentes abaixo são executados, sem edição presumida.

### Decisões visuais fechadas

- C01: herança do foreground do próprio Selo; não alterar muted global.
- R01: breakpoint depende da largura útil do container, não do viewport. Iniciar limiar da lista em56rem úteis e manter condições exatamente complementares; confirmar borda no navegador. Não presumir viewport896px. Mudança de limiar, se necessária pelos dados sintéticos, permanece dentro deste desenho e deve ser documentada com as medidas. Filtros podem ter limiar local menor, com prova de busca/labels legíveis. Não reduzir alvo44px da ajuda, fonte ou conteúdo para esconder a colisão; não mascarar com overflow:hidden.
- M01: faixa móvel no fluxo, sem sticky neste ciclo, sem mover a organização ou redesenhar seu header. Overlay aberto continua diálogo deliberado. Não deslocar campo Situação V110 para contornar o acionador global.
- D01: somente os três campos nomeados. Preservar ISO, required/min, handlers e valores; o patch não muda locale/formato apresentado nem introduz datepicker customizado.
- B01: nenhum fix do produto/marca baseado na hipótese de decode. Se a marca continuar ausente depois da barreira, interromper aceitação B01 e investigar novo dado antes de ampliar BUILD.

## 3. RED histórico imutável e reprodução

As provas abaixo permanecem com seus resultados originais: oito casos FAIL Axe, V101 com colisões, Menu sobre controle e calendário de baixa percepção. Ausência de marca em V121390dark é defeito do artefato; corrida de decode é hipótese. Nenhum FAIL é reescrito como PASS. Hashes são os do report/manifesto original, já conferidos nas revisões independentes. Todos os arquivos são relativos ao ZIP Run78; cada linha possui principal, suplemento e DOM.

Reprodução de integridade: extrair ZIP original em diretório separado e executar `sha256sum --check SHA256SUMS`; conferir ZIP e report pelos hashes acima. Reproduzir leitura visual abrindo os arquivos originais, sem composição, edição ou recaptura. Para os oito Axe FAIL, consultar também `records[].accessibility.violations` do report, mantendo incomplete separado. Para reproduzir layout/cor em execução, usar o frontend/harness históricos em ambiente isolado e dados sintéticos catalogados; se a identidade histórica não puder ser servida, registrar indisponibilidade e conservar o RED original como prova. Não anunciar reprodução nova sem log/identidade.

| RED | Caso | Principal / SHA256 | Suplemento / SHA256 | DOM / SHA256 |
|---|---|---|---|---|
| R01 colisão | V101_768_light | screenshots/V101_768_light.png / `cb69e9fff8ab30f3ced3c6b57d281618533c37a6f1b858627dca877b99da0460` | screenshots/V101_768_light_sidebar-recolhida.png / `19b820add8dff44437d7caeb96003bc7c239764b7bad1d7012ad6488e97d101e` | dom/V101_768_light.json / `0a21bb0789f32cc6fec42fd6ee74cb3b2ee39460476afe4b9dc3fac4744d5470` |
| R01 colisão | V101_768_dark | screenshots/V101_768_dark.png / `1aec71a635add5f790a0b2de62fab22661f983e1bdd436632dd39d343a23c3c9` | screenshots/V101_768_dark_sidebar-recolhida.png / `1d78c968b6065f0fdc7c0cdf5cfed9e421ed26861bfbfe6da23c4f24184e64c9` | dom/V101_768_dark.json / `eb13901d806d71736cf9b6e96c772743f84d6c4d0adfc79240802a01a5cdb6c2` |
| D01 indicador | V105_1440_dark | screenshots/V105_1440_dark.png / `a892e1e6df98575dc7b546061113cf30f0eb1bdb1b4b32331acded1dd46b3f90` | screenshots/V105_1440_dark_sidebar-recolhida.png / `8593f46b0ecbe7925e8e906247c149174460a62feaf01fcb4b9cc43072825467` | dom/V105_1440_dark.json / `959ac299a504ba8ea889c6b5c346daf8b4987d6cbac6af7a338aa915533c865a` |
| D01 indicador | V105_1280_dark | screenshots/V105_1280_dark.png / `d539a4dd86e32e8ac30a2ad9dcfc522e8e3d2bdf9e9c6430fec4394be2538229` | screenshots/V105_1280_dark_sidebar-recolhida.png / `5703200ddf7a542f8194ea01b7187521012f8ddfeed45bf2d66e28f4cef90ff0` | dom/V105_1280_dark.json / `983afa859ac6ec4d22bb1f677861f4007603182979bf39ba36b1a9139e9bc1a5` |
| D01 indicador | V105_768_dark | screenshots/V105_768_dark.png / `a1506e885f5508288e5b9c11a8ee6be54cb3097fc82be85d86d83b7552257d13` | screenshots/V105_768_dark_sidebar-recolhida.png / `627ca6a239e4615429d418bffff40661b99de7fe29a3f2e4b58cb2051d9ff858` | dom/V105_768_dark.json / `506f234e4957f8941c6e4b03c4147dce65631150044f8bd05fd95bbe3114b9ad` |
| D01 indicador | V105_390_dark | screenshots/V105_390_dark.png / `277e23141cc3ae3d6e4f5890fe499b6700f78abe3eda9829c42d251255e6d150` | screenshots/V105_390_dark_menu.png / `01479b0ea5a09db1e82e4491c0516af04df2b08e2dd0604875b8b430d7a229d0` | dom/V105_390_dark.json / `7bfb524931baef0f6a2fd5444b1ae75cd6e1a4b52868a91b902179b2315bb248` |
| C01 Axe FAIL | V106_1440_light | screenshots/V106_1440_light.png / `1c84590f40c452a150bc52fb69f0cd938b6306588a98ead0855a8654e8c34278` | screenshots/V106_1440_light_sidebar-recolhida.png / `256ebedba5d58aa85eeaeb102f49603992bad85512e326e13111175bc17ba10a` | dom/V106_1440_light.json / `ccc840c58b58a2036ce4e1311cb31184c4f9407c4129830f4d5eba38e9548fb0` |
| C01 Axe FAIL | V106_1280_light | screenshots/V106_1280_light.png / `c2562816aa71c8dbbe930c675a0cd3e32f4ed59f234844bdd0a323032cb7ced3` | screenshots/V106_1280_light_sidebar-recolhida.png / `c37e4c97fd204b7a3ea548fe52ce26bf2e710d426c62804ecf5cd57c5e79eb9f` | dom/V106_1280_light.json / `6d7758eb6f9a864c63b9ffedf7e44d8ee08c23f7ad9a5f31658280def7743e1f` |
| C01 Axe FAIL | V106_768_light | screenshots/V106_768_light.png / `9c48a9d68a28222cfafc9dc17ddf0e7ae01ba1047f0f0fb290d417d4f8f815b7` | screenshots/V106_768_light_sidebar-recolhida.png / `13867b5c347711d003ba1547e65af754467da81701be4ca026e9c439a1d35dac` | dom/V106_768_light.json / `d279df5a15021e4ad7990dfff7cef351886881f71341ed8c80149d9932e95c5e` |
| C01 Axe FAIL | V106_390_light | screenshots/V106_390_light.png / `159f08c5d4d2bc0646ff8d6b58308a048817afaf78c1ab596166446f2d2450b2` | screenshots/V106_390_light_menu.png / `04919253d7a03e0217c83562a7904cfe4ce1beb1e6cecd48a94a95e20b5deca0` | dom/V106_390_light.json / `4a1173336c463b00ac15c0d2411fd1ddb5ccf72c42da213e677b9c06457da5ad` |
| C01 Axe FAIL | V107_1440_light | screenshots/V107_1440_light.png / `497e9af386dcdf3da9faa43e183a8a75b43ed6aa122d594fe46dd6ce8cbba9b2` | screenshots/V107_1440_light_sidebar-recolhida.png / `4c519a75cd768ef8c7f3e2cc0bedf55fe185c96d6416bbff651701bfe7f76c26` | dom/V107_1440_light.json / `5010d893acfbfdf5c7f1d25b27ca02416d118f5143e6317c0ea7c1a3ca67e47a` |
| C01 Axe FAIL | V107_1280_light | screenshots/V107_1280_light.png / `f8566d6d1723058d9c8a50b78c7068fb3b9ba67d19fad46142f67dd637054c22` | screenshots/V107_1280_light_sidebar-recolhida.png / `fc307aa7113f7b7fea63af1e7816e8278785be311fe34a5e545191862bbd560f` | dom/V107_1280_light.json / `26044ce800191f855dfe4e8ca20a55f81db72dda2e13ee51e7dd5f5c5a7c2c52` |
| C01 Axe FAIL | V107_768_light | screenshots/V107_768_light.png / `e48451a92d27ed1b7d61ad697cb403224406b270a4f7121bc48a4ff8e47870f6` | screenshots/V107_768_light_sidebar-recolhida.png / `18e7407e3e75328fb8e93b33d65e02f9aa461dc546cb2dbaf5594ac9dfca7bf9` | dom/V107_768_light.json / `23b8fdafaf63753067b5722fd7f59eb1d03878bdea247ebfa3d23bcb08594298` |
| C01 Axe FAIL | V107_390_light | screenshots/V107_390_light.png / `0c53f725304a9ac34ce57ad010be22c31224b2ffa52e152b16dfbba2136d4b35` | screenshots/V107_390_light_menu.png / `5c18616538407280b6bf4b5b1a5bb620b420622128a2f775d7f240f34702db42` | dom/V107_390_light.json / `a6c741e918ea815a50fb363b6683efe3e185a03a60d0dd3568a4650c60bdf43f` |
| M01 sobreposição | V110_390_light | screenshots/V110_390_light.png / `e813900f7aaeb3b641331a25b631b6eea0806773b7989263a39debfa616fcfbf` | screenshots/V110_390_light_menu.png / `83487b955be957c864a2d88dfdf208634d935480bbd281f4ddbe2d737878d225` | dom/V110_390_light.json / `6e69a42fb1d8e70d9d15df88da32920c86a1fcfc964388c36fb46afcaee96f66` |
| M01 sobreposição | V110_390_dark | screenshots/V110_390_dark.png / `751c5f75e8a9d1b5e3318268cfac15983d4f7c3dc5352e4eecdd2335090faea3` | screenshots/V110_390_dark_menu.png / `7783c3b1e9ef96196d0ca3016f5bc99aca8ba1e87c3fb3bfe35160aa89f7e8e5` | dom/V110_390_dark.json / `524f650e3017113659c868d9d895d59eecbf9d85e7796039c2e9839982bfb237` |
| D01 indicador | V113_1440_dark | screenshots/V113_1440_dark.png / `17252cc3ee57f32905950b10ba9e5ca509f2299db8ee620ad141b3bd1343e2e1` | screenshots/V113_1440_dark_sidebar-recolhida.png / `6e00a3434ae4a896bed3999c0a0f0e6697fd166b1bffc9f8c98c36a408ecf34d` | dom/V113_1440_dark.json / `cedf58764a9b67cb8b14d0510fa092530614650f21ea7bef4fdf35c1c4937c0a` |
| D01 indicador | V113_1280_dark | screenshots/V113_1280_dark.png / `2588a092bb295d8e900b8b7d21ee3f426783bc6ece25b85ba301a2e152708993` | screenshots/V113_1280_dark_sidebar-recolhida.png / `67a1f7010ec528bd9993a4fe22c411a73f25a6aecea504dc9710cad9e86a4483` | dom/V113_1280_dark.json / `06761fee760941d80bb997237638314ff51d51d0d513a0821558d93af96fb391` |
| D01 indicador | V113_768_dark | screenshots/V113_768_dark.png / `55b45ed508a21418c740eb9cfa61ea91930027a7a8239edbf9b0589a4908d691` | screenshots/V113_768_dark_sidebar-recolhida.png / `86e019d2695092555e5568f7630fe6ffe996586643a3552124dd84b21e5bc595` | dom/V113_768_dark.json / `28bfa317a5781c69bdb6b01da53ed843e9d549b3154eabc1541e4ba66853248e` |
| D01 indicador | V113_390_dark | screenshots/V113_390_dark.png / `e550254169699b00cc8bd76b68fb62e1482fe624cc7fb41796ea19f47be3b931` | screenshots/V113_390_dark_menu.png / `53127640c9c6639c9a334aae0c22312571ffd67f6da767bba24da82811ff18b5` | dom/V113_390_dark.json / `3482abfb2b9cc2e371603b930fb8a2bc10962d64c575c088b97344833d7dd8b1` |
| B01 marca ausente no suplemento | V121_390_dark | screenshots/V121_390_dark.png / `c630856e7bfdaa71874f36e83bb1ac58747f45f9d86d8b2705cc170ab85e1ccb` | screenshots/V121_390_dark_menu.png / `0690150731f6d34e6ea78e09ed81f1307e6492e4d6e9f24c53ebbe4272d4ca84` | dom/V121_390_dark.json / `7465c2127771f123cd0468c112c396234a7862ba8c4408bb879d6d383afd2824` |

Revisões que dão suporte ao RED, a incorporar de forma durável nos arquivos nomeados na seção7: cadastros56casos/112PNG, documentos32casos/64PNG e contratos16casos/32PNG, total104casos/208PNG originais. Insumos locais: `trilha-review-cadastros.md/.json`, `trilha-review-documentos.md/.json`, `trilha-review-contratos.md`, `trilha-review78-cases.csv`, `trilha-review-cadastros-causas-plan-gate.md` e `trilha-investigacao-menu-marca.md`. Não tratar nomes em /tmp como prova de integração. O PR documental deve anexar conteúdo saneado e hashes duráveis, não apenas referenciar caminhos efêmeros.

## 4. RED executável, BUILD e GREEN sem falsa prova de layout

Após merge do GATE, escrever os testes antes do helper/fix e registrar RED com comando, código esperado, HEAD completo e log; depois implementar e registrar GREEN no HEAD final. Não remover expectativas para obter GREEN. Não exigir que um teste JSDOM detecte pintura, caixa, CSS media/container ou razão de contraste: ele não mede esses fenômenos.

| Prova significativa | RED esperado | GREEN necessário |
|---|---|---|
| Barreira causal pós-montagem | Sequência antiga captura antes do decode e aceita contagem visual sem imagem pronta. Spy de eventos deve detectar PNG antes do marco de prontidão. | Ordem verificável: abrir menu → diálogo único → imagem oficial única → complete/naturalWidth positivo → decode resolvido com timeout → fence drain/assert → dois RAF → diagnóstico/medidas/privacidade válidos → PNG. Falha em qualquer etapa impede save. |
| Casos de imagem controlados, sem rede HML | Asset retardado ainda não terminou quando a captura antiga dispara; broken/zero naturalWidth/decode rejeitado antes não invalidavam o suplemento. | Teste de promessa controlada comprova espera; rejeição, timeout, zero dimensão, imagem ausente/duplicada/src não oficial produzem código fechado e zero captura. Complementar com imagem realmente carregada/retardada/quebrada em Chromium isolado existente, sem autenticação/secrets. |
| Seleção e proveniência | Skip indiscriminado dos24baseline deixa de testar Menu alterado nos6mobile. | Seleção fixa inclui V114/V116/V118390 light/dark; outras18 permanecem PRESERVADO_BASELINE com origem própria. Caso fora catálogo, identidade errada, falta de DOM/PNG/hash ou métrica posterior ao PNG não recebe aprovação. |
| Helpers de geometria/hit-test | Dados de caixas reais do RED mostram interseção/oclusão; checker a rejeita. Teste unitário de retângulos detecta interseção, tangência, elemento fora viewport e alvo zero. | Coletores executam no navegador real, não recebem caixas fabricadas como prova do produto. Rejeitam NaN/Infinity, elemento desconectado/oculto e controle inacessível. Retângulo sem interseção não basta sem hit-test e revisão PNG. |
| Cor e esquema nativo | RED histórico contém oito Axe FAIL; date/month escuros sem orientação nativa permanecem com indicador escuro. | Cor computada/renderizada de rótulo/fundo e resultado Axe medidos no navegador; schema guarda razão/limiar e nó exato. Para os3campos, computed color-scheme acompanha a classe inclusive com SO oposto. Não inventar razão do indicador a partir do computedStyle se a peça nativa não for amostrada. |
| Comportamento preservado | Só criar RED novo se houver falha real da expectativa comportamental proposta; não inventar regressão de contrato que já passava. | Testes existentes de fluxo/semântica/valor passam; novo teste shell, se necessário, verifica comportamento observável e não string de classe. Mudança visual reversível não requer teste espelhando implementação. |

Oito provas nativas causais do auditor seguem obrigatórias no HEAD final; o novo teste de imagem não substitui nenhuma. Ausência do Chromium ou instabilidade de execução é bloqueio específico, não licença para trocar layout real por JSDOM. Teste local isolado usa apenas ferramentas já congeladas e não altera lock/dependências.

### Comandos fechados do GREEN

Executar a partir da raiz isolada, com dependências congeladas da base. Não executar format automático em arquivos fora da allowlist. Registrar cada comando e exit code, sem prometer que foram executados por este documento.

```sh
bun install --frozen-lockfile
bun run test -- src/test/contratoDetalhe.test.tsx src/test/baseNormativa.test.tsx src/test/contratantes.test.tsx src/test/appShellSidebar.test.tsx src/test/visualShell.test.tsx src/test/novoContrato.test.tsx src/test/novaCompetencia.test.tsx src/test/brand.test.tsx src/test/sidebarRouter.test.tsx src/test/documentosContrato.test.tsx src/test/historicoContrato.test.tsx
node --test scripts/hml/authenticated-visual-audit.test.mjs
bun run test
bun run lint
bunx tsc --noEmit
bun run build
node scripts/hml/authenticated-visual-audit.mjs --native-guard
```

Prettier --check aplica somente aos arquivos alterados desta allowlist e aos documentos novos; usar a versão já instalada. Confirmar os comandos canônicos da CI da main antes da execução, sem criar script npm para facilitar. Exigir checks existentes LOCK-TYPES (dupla barreira), Zero-Drift, security/BRAND e demais checks obrigatórios da branch, com links/run/HEAD; `tsc` local não substitui esses gates. Diff de tipos/lock/SVG/assets deve ser zero. Número histórico1165+ não é substituto do total real final registrado, nem autorização para aceitar regressão.

## 5. Teste C HML final, somente após merge e publicação comprovada

Teste C usa o workflow e o comando `--audit` existentes, sem novo workflow, input ou CLI de escrita. Preferência mínima: manter a execução completa já suportada e aplicar seleção focal testável às verificações/resultados visuais deste GATE. Não criar nova flag de execução para esta mudança. A seleção dos seis baseline móveis deve ser explícita no código do auditor, coberta por teste e manter a identidade histórica dos18preservados; não remover sua proveniência para preencher contagem.

Se a execução existente capturar também superfícies não focais, guardá-las como resultados adicionais identificados, sem chamá-las todas de recapturas necessárias nem agregá-las a outro run. No catálogo Run78 conhecido,104casos são capturáveis e6baseline móveis adicionais levam a110casos recapturáveis; a seleção focal abaixo tem74casos. Se a main integrar outro catálogo/fixture legítimo antes deste BUILD, reconciliar o catálogo no PR e registrar seleção real sem herdar PASS automaticamente. Os bloqueios de PII e fixture não são removidos por este GATE.

Preflight final: frontend/harness SHA completos, deployment resolvido pelo alias, grafo/SSR/assets publicados comprovados, mesma origem/API,8provas nativas no executor final, sandbox/fence/CSP/proxy/privacidade válidos. Secrets somente no passo normal do workflow. A sessão confirma contexto sintético e logout final. Nenhum screenshot/DOM/console bruto contendo campo desconhecido é publicado; não ampliar catálogo de PII nem usar sanitização posterior para justificar coleta proibida.

| Seleção focal canônica | Larguras/temas/estados | Aceitação e dados medidos |
|---|---|---|
| V101 | 1440/1280/768/390 × light/dark, principal e suplemento | Uma representação visível/acessível, filtros e link editar preservados. Medir container, conteúdo de cabeçalhos, ícone de ajuda44px, badges e colunas. Zero interseção indevida e clipping. |
| V105 | Mesmas8combinações | Dois dates visíveis, esquema nativo correto, indicador pintado sem corte. Valor ISO e required/min preservados em teste isolado sem salvar negócio. |
| V106/V107 | Mesmas8combinações por superfície | Repetir os8casos light que falharam e os8dark de regressão. Axe nos nós exatos e razão real texto/fundo apropriada à tipografia (4,5:1 em rótulo pequeno). Guardar incomplete sem promovê-lo a PASS. |
| V110 | Mesmas8combinações | Menu não encobre Situação/seta ou foco. Geometria+hit-test reais ao rolar e PNG principal/suplemento. |
| V113 | Mesmas8combinações | Apenas month `#v113-mes`, mesmos requisitos de esquema/indicador/valor, sem criar competência. |
| V121 | Mesmas8combinações | Marca oficial na principal/suplemento conforme estado. Rede fria/quente para390light/dark, barreira e diagnóstico anteriores ao PNG. Repetição limitada a3por condição, identificada separadamente, nunca escolher silenciosamente a melhor captura. |
| SYS05/ADM01/V102/V103/V104/V108 | Somente390 × light/dark, principal e menu | Mudança Menu é AppShell global: comparar todas as demais superfícies capturadas do Run78 no mobile, inclusive Salvar V102 e Valor global V105 já incluído acima; foco, links e organização preservados. |
| V114/V116/V118 | Somente390 × light/dark, principal e menu | Seis casos novos de regressão do Menu global, usando apenas conteúdo sintético já catalogado e validado. Segurança/PII deve passar antes de coletar. Se contexto atual divergir, bloquear caso e investigar; não presumir que a prova antiga autoriza coletar texto atual desconhecido. |

Contagem focal:7superfícies×8=56casos;6outras×2mobile=12;3baseline×2mobile=6; total74casos,148PNG principais/suplementos e74DOM se todos realmente seguros/capturados. Essa é exigência de escopo, não resultado antecipado. Novos casos além da matriz ou repetições diagnósticas não aumentam a matriz oficial.

### Provas adicionais fora da contagem canônica

- R01:1024 e767/768/769, ambos temas, sidebar expandida/recolhida, zoom200%; além dos pontos de largura ÚTIL real do container56rem−1px/igual/+1px. Calcular viewport a partir do padding e sidebar, confirmar largura por getBoundingClientRect. Reusar dados sintéticos catalogados; variantes longas/ausentes/inativo apenas no navegador local isolado, sem escrever HML. Documentar cada combinação realmente executada e não contar em232/208ou74.
- M01:390 e767 com alturas640 e1000, ambos temas; percorrer do topo ao fim. Com Menu fechado, medir retângulos e `elementFromPoint` no centro/bordas/seta de campos visíveis e do controle focado; acionador não pode ser hit target no lugar do campo. Abrir/fechar/Escape/Tab/Shift+Tab/foco contido/retorno e scroll até Auditoria. Verificar desktop768/1280/1440 nas superfícies focais e suites de shell. Não inferir inacessibilidade permanente do PNG antigo.
- D01:tema do app light/dark com preferência de SO oposta, campo vazio e preenchido localmente, troca de tema sem perder valor, navegação por teclado e seleção nativa. Chromium do harness; outro motor só se suporte declarado exigir, com resultado separado. Não prometer locale por lang e não medir “contraste do ícone” usando apenas cor de texto do input.
- B01:diagnóstico mínimo src oficial, complete, naturalWidth/Height, rect positivo, decode concluído e código limitado de falha. Sem resposta/trace/HAR/headers. Contagem de img não demonstra pintura: revisão dos PNG continua obrigatória. Decode concluído com marca ausente bloqueia B01 e exige investigação nova de produto.

Captura deve ocorrer depois da medição e da estabilização, nunca antes. Preservar PNG original do navegador e DOM acessível correspondente, hash de cada arquivo e relatório. Proibido compor, retocar, recapturar silenciosamente por falha ou alterar SRC durante Teste C. Falha retorna a novo BUILD/GREEN/merge/publicação e gera novo run com identidade própria.

## 6. Baseline, públicos e limites preservados

Run78 permanece imutável:96PASS_AUTOMATIZADO,8FAIL,56BLOQUEADO_PII,24PRESERVADO_BASELINE,24BLOQUEADO_FIXTURE, com natureza parcial. Os24baseline são V114/V116/V118 × quatro larguras × dois temas. A mudança global no Menu justifica nova prova APENAS dos6mobile390; as18combinações1440/1280/768 mantêm seus hashes/status históricos, sem alegação de recaptura. A nova prova mobile é comparação anexada, não substituição dos24registros antigos. Mudança desktop além do previsto exigirá emenda de escopo e recaptura correspondente.

As18provas públicas históricas permanecem com identidade própria, preservadas e sem soma à cobertura privada desta rodada. O patch não toca login, favicon, PWA, manifest, boot/erro ou asset; diff/hash comprova preservação. Não declarar as18repetidas por passar teste privado. Não alterar o resultado de nenhum arquivo antigo para acomodar o patch.

A revisão dos208PNG originais é da cadeia de104casos capturados, não significa208casos completos. O ledger de208casos da matriz deve distinguir96PASS parciais,8FAIL e bloqueios/baseline; o ledger de208PNG deve identificar cada original visto e seu revisor. Nenhuma soma certifica72critérios, WCAG integral, BRAND01 final ou V1. V1 permanece NO-GO até DoD integral.

## 7. Arquivos duráveis obrigatórios de resultado e revisão

Caminhos finais definidos antes da execução, relativos ao repositório. Não inserir screenshot/DOM/response sensível no Git; arquivos binários de execução ficam no artefato saneado do workflow com retenção vigente e hashes no índice documental.

| Caminho | Conteúdo obrigatório |
|---|---|
| `docs/frontend/planos/TRILHA_A_VISUAL_RUN78_GATE_2026-11-08.md` | Este GATE, após revisão documental. |
| `docs/frontend/auditorias/TRILHA_A_RUN78_REVISAO_INDEPENDENTE_2026-11-08.md` | Consolidação fiel das3revisões dos208PNG originais, achados, causas/hipóteses,72limites e identidade Run78. |
| `docs/frontend/auditorias/evidencias/visual-run78-20261108/run78-originals-208png-ledger.csv` | Uma linha por PNG original efetivamente visto: caso, tema/largura, principal/suplemento, arquivo, SHA256, revisor, achados e limitação.208linhas de arquivo, sem confundir com208casos da matriz. |
| `docs/frontend/auditorias/evidencias/visual-run78-20261108/run78-matrix-208cases-ledger.csv` | Uma linha por combinação do catálogo Run78, status original e vínculo dos2PNG/DOM quando existirem; bloqueios e baseline explícitos. |
| `docs/frontend/auditorias/evidencias/visual-run78-20261108/red-evidence.json` | Lista fechada dos21casos RED acima, hashes principal/suplemento/DOM e ponte para report/ZIP; sem dados desconhecidos. |
| `docs/frontend/auditorias/TRILHA_A_VISUAL_RUN78_RED_GREEN_2026-11-08.md` | HEADs, comandos/logs RED→BUILD→GREEN, checks, diff/LOCK/Zero-Drift, decisões de limiar e revisão independente do código/harness. |
| `docs/frontend/auditorias/TRILHA_A_VISUAL_RUN78_TESTE_C_RESULTADO_2026-11-08.md` | Run final real, frontend/harness/deploy/ZIP/reportSHA, seleção focal executada, medidas, comparação antes/depois, revisão de cada novo PNG e pendências. Não criar resultado fictício antes de executar. |
| `docs/frontend/auditorias/evidencias/visual-run78-20261108/teste-c-focal-ledger.csv` | Casos novos com status, nós Axe/incomplete, geometria/cor/decode, arquivos e SHA, origem real e revisão; referência a artefato do workflow sem substituir antigos. |
| `docs/frontend/auditorias/evidencias/visual-run78-20261108/SHA256SUMS` | Hashes dos documentos/ledgers/RED revisados; cada artefato de execução também mantém seu próprio SHA256SUMS completo. |

A allowlist documental inclui esses arquivos, o PLANO_ATIVO/checkpoint oficial já existente do projeto e referências de PR/checks. Não inventar caminho novo de checkpoint: usar o oficial encontrado na main. Atualização deve registrar PLAN/GATE/BUILD PRs, SHAs completos, CI, testes reais, última etapa comprovada e próxima; consultar GitHub após merge para declarar integração.

## 8. Portões de conclusão e rollback

1. GATE documental: diff só documental, CI verde, revisão independente e merge verificáveis antes de SRC.
2. BUILD: allowlist acima, RED significativo preservado, GREEN/checks exigidos e8provas nativas no HEAD final, revisão independente antes do merge. Sem proteção de branch contornada.
3. Teste C: publicação e sessão comprovadas, medições reais+PNG/DOM/SHA e revisão independente de TODOS os originais novos efetivamente usados para aceitar correções. Sem aprovação presumida por Axe0, decode, overflowX0 ou contagem.
4. Resultado: C01 resolve8FAIL antigos em nova prova; R01/M01/D01/B01 cumprem requisitos acima. Pendência, PII ou novo defeito fica explícito; não fechar issue350 ou declarar V1 por este gate focal.
5. Rollback por PR retira apenas o patch visual/harness deste ciclo se necessário, preservando evidências antigas/novas e históricos. Nenhuma exclusão de dado ou afrouxamento de cerca para obter PASS.

Este documento não executou Teste C nem autorizou BUILD por si só. O próximo passo é revisão/CI/merge do GATE documental.

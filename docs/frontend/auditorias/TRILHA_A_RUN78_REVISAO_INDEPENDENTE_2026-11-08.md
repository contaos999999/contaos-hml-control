# Revisão independente integral dos208PNG Run78

Artefato13629564203, run42511641527.208originais/104casos capturados revisados; matriz208casos inclui bloqueios e baseline. Nenhuma certificação global.



---

# Revisão visual independente de cadastros, Run78

Escopo: SYS05, ADM01 e V101–V105; 56 casos, 112 PNG originais efetivamente inspecionados individualmente com view_image. Nenhuma imagem foi composta, editada ou recapturada. Leitura do report e dos 56 DOM para contexto. Nenhuma alteração no produto, dados ou GitHub.

Frontend `241dd775d14a0d2a1ec24c93ae3f655c79d3efd2`; harness `2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33`; deployment `dpl_AoNgZRZnutXauuPsfQ2shEmUaULS`.

Os 112 SHA256 calculados coincidem tanto com report.json quanto com SHA256SUMS. O ledger JSON contém hash completo, verificação do manifesto, notas por caso, axe, teclado e suplemento.

Identidade e shell: marca ContaOS, navegação com estado ativo ciano, organização e situação ativa consistentes. Hierarquia e estados vazios observados legíveis, salvo achados abaixo. Foco ciano visível nos botões de expandir/fechar menu dos suplementos. Em mobile o menu aberto ocupa o viewport; conteúdo abaixo em screenshot fullpage não prova falha do overlay.

Limites: apenas estados gravados. Os 56 casos têm zero violations Axe; 40 têm incomplete=1, 14 incomplete=0 e 2 incomplete=2. Isso não é aprovação integral. Teclado registrado forward/backward passou com cobertura AMOSTRA_NAO_WCAG_INTEGRAL; não reproduzido nesta revisão. navigationVerified=true e sidebarSupplement.passed=true nos 56; não há campo sidebarNavigation nestes registros. Navegação aparente verificada visualmente, sem executar transições. Não testados formulário preenchido, erros, submit, persistência ou todos estados de foco. Não deduzido contraste por imagem, nem certificação V1/72/WCAG integral.

## Achados

Critical: nenhum observado neste escopo.

| ID | Severidade | Escopo | Achado |
|---|---|---|---|
| I01 | Important | V101 768 light/dark | Tabela comprimida: DOCUMENTO/TIPO se encostam; Situação/Atualizado em/ícone e badge/data se sobrepõem na principal. No suplemento recolhido permanece colisão do ícone com Atualizado em. overflowX=0 não detecta a colisão interna. |
| I02 | Important | V105 dark, 1440/1280/768/390 | Ícones de calendário quase imperceptíveis sobre o campo escuro nos dois campos de data, principal e suplemento onde o formulário está visível. Afeta descoberta do seletor. Constatação visual; razão de contraste não medida e nenhum critério WCAG declarado reprovado por imagem. |
| M01 | Minor | ADM01 todas; V104 todas | Matriz de permissões usa termos sem acentos, como analises, apresentacoes, competencias, historico e orcamentos. V104 usa badge media sem acento e rascunho em caixa distinta de Ativo. Revisar texto editorial. |
| M02 | Minor | V102 390 light/dark; V105 390 light/dark | Menu flutuante invade canto direito do Salvar em V102, mantendo rótulo visível; em V105 invade parte direita do campo Valor global, mantendo valor observado visível. Evitar sobreposição com controles em rolagem. |
| M03 | Minor | V104 768 light/dark | Card ocupa aproximadamente metade do painel disponível e deixa área vazia à direita. Vigência com data ausente quebra para linha extra na principal. Sem perda de texto observada. |
| M04 | Minor | V105 todas | Campos de data mostram mm/dd/yyyy em interface portuguesa. Placeholder longo da busca por contratante termina cortado nativamente; texto auxiliar mantém instrução. Não foram exercitados seletor nativo ou preenchimento. |

## Matriz de 56 casos

Cada linha relaciona os dois originais vistos. “Sem achado específico” significa somente o estado visual registrado; os limites acima se aplicam a todos.

| Caso | Principal | Suplemento | Achados |
|---|---|---|---|
| SYS05 1440 light | screenshots/SYS05_1440_light.png | screenshots/SYS05_1440_light_sidebar-recolhida.png | Sem achado específico |
| SYS05 1440 dark | screenshots/SYS05_1440_dark.png | screenshots/SYS05_1440_dark_sidebar-recolhida.png | Sem achado específico |
| SYS05 1280 light | screenshots/SYS05_1280_light.png | screenshots/SYS05_1280_light_sidebar-recolhida.png | Sem achado específico |
| SYS05 1280 dark | screenshots/SYS05_1280_dark.png | screenshots/SYS05_1280_dark_sidebar-recolhida.png | Sem achado específico |
| SYS05 768 light | screenshots/SYS05_768_light.png | screenshots/SYS05_768_light_sidebar-recolhida.png | Sem achado específico |
| SYS05 768 dark | screenshots/SYS05_768_dark.png | screenshots/SYS05_768_dark_sidebar-recolhida.png | Sem achado específico |
| SYS05 390 light | screenshots/SYS05_390_light.png | screenshots/SYS05_390_light_menu.png | Sem achado específico |
| SYS05 390 dark | screenshots/SYS05_390_dark.png | screenshots/SYS05_390_dark_menu.png | Sem achado específico |
| ADM01 1440 light | screenshots/ADM01_1440_light.png | screenshots/ADM01_1440_light_sidebar-recolhida.png | M01 |
| ADM01 1440 dark | screenshots/ADM01_1440_dark.png | screenshots/ADM01_1440_dark_sidebar-recolhida.png | M01 |
| ADM01 1280 light | screenshots/ADM01_1280_light.png | screenshots/ADM01_1280_light_sidebar-recolhida.png | M01 |
| ADM01 1280 dark | screenshots/ADM01_1280_dark.png | screenshots/ADM01_1280_dark_sidebar-recolhida.png | M01 |
| ADM01 768 light | screenshots/ADM01_768_light.png | screenshots/ADM01_768_light_sidebar-recolhida.png | M01 |
| ADM01 768 dark | screenshots/ADM01_768_dark.png | screenshots/ADM01_768_dark_sidebar-recolhida.png | M01 |
| ADM01 390 light | screenshots/ADM01_390_light.png | screenshots/ADM01_390_light_menu.png | M01 |
| ADM01 390 dark | screenshots/ADM01_390_dark.png | screenshots/ADM01_390_dark_menu.png | M01 |
| V101 1440 light | screenshots/V101_1440_light.png | screenshots/V101_1440_light_sidebar-recolhida.png | Sem achado específico |
| V101 1440 dark | screenshots/V101_1440_dark.png | screenshots/V101_1440_dark_sidebar-recolhida.png | Sem achado específico |
| V101 1280 light | screenshots/V101_1280_light.png | screenshots/V101_1280_light_sidebar-recolhida.png | Sem achado específico |
| V101 1280 dark | screenshots/V101_1280_dark.png | screenshots/V101_1280_dark_sidebar-recolhida.png | Sem achado específico |
| V101 768 light | screenshots/V101_768_light.png | screenshots/V101_768_light_sidebar-recolhida.png | I01 |
| V101 768 dark | screenshots/V101_768_dark.png | screenshots/V101_768_dark_sidebar-recolhida.png | I01 |
| V101 390 light | screenshots/V101_390_light.png | screenshots/V101_390_light_menu.png | Sem achado específico |
| V101 390 dark | screenshots/V101_390_dark.png | screenshots/V101_390_dark_menu.png | Sem achado específico |
| V102 1440 light | screenshots/V102_1440_light.png | screenshots/V102_1440_light_sidebar-recolhida.png | Sem achado específico |
| V102 1440 dark | screenshots/V102_1440_dark.png | screenshots/V102_1440_dark_sidebar-recolhida.png | Sem achado específico |
| V102 1280 light | screenshots/V102_1280_light.png | screenshots/V102_1280_light_sidebar-recolhida.png | Sem achado específico |
| V102 1280 dark | screenshots/V102_1280_dark.png | screenshots/V102_1280_dark_sidebar-recolhida.png | Sem achado específico |
| V102 768 light | screenshots/V102_768_light.png | screenshots/V102_768_light_sidebar-recolhida.png | Sem achado específico |
| V102 768 dark | screenshots/V102_768_dark.png | screenshots/V102_768_dark_sidebar-recolhida.png | Sem achado específico |
| V102 390 light | screenshots/V102_390_light.png | screenshots/V102_390_light_menu.png | M02 |
| V102 390 dark | screenshots/V102_390_dark.png | screenshots/V102_390_dark_menu.png | M02 |
| V103 1440 light | screenshots/V103_1440_light.png | screenshots/V103_1440_light_sidebar-recolhida.png | Sem achado específico |
| V103 1440 dark | screenshots/V103_1440_dark.png | screenshots/V103_1440_dark_sidebar-recolhida.png | Sem achado específico |
| V103 1280 light | screenshots/V103_1280_light.png | screenshots/V103_1280_light_sidebar-recolhida.png | Sem achado específico |
| V103 1280 dark | screenshots/V103_1280_dark.png | screenshots/V103_1280_dark_sidebar-recolhida.png | Sem achado específico |
| V103 768 light | screenshots/V103_768_light.png | screenshots/V103_768_light_sidebar-recolhida.png | Sem achado específico |
| V103 768 dark | screenshots/V103_768_dark.png | screenshots/V103_768_dark_sidebar-recolhida.png | Sem achado específico |
| V103 390 light | screenshots/V103_390_light.png | screenshots/V103_390_light_menu.png | Sem achado específico |
| V103 390 dark | screenshots/V103_390_dark.png | screenshots/V103_390_dark_menu.png | Sem achado específico |
| V104 1440 light | screenshots/V104_1440_light.png | screenshots/V104_1440_light_sidebar-recolhida.png | M01 |
| V104 1440 dark | screenshots/V104_1440_dark.png | screenshots/V104_1440_dark_sidebar-recolhida.png | M01 |
| V104 1280 light | screenshots/V104_1280_light.png | screenshots/V104_1280_light_sidebar-recolhida.png | M01 |
| V104 1280 dark | screenshots/V104_1280_dark.png | screenshots/V104_1280_dark_sidebar-recolhida.png | M01 |
| V104 768 light | screenshots/V104_768_light.png | screenshots/V104_768_light_sidebar-recolhida.png | M01, M03 |
| V104 768 dark | screenshots/V104_768_dark.png | screenshots/V104_768_dark_sidebar-recolhida.png | M01, M03 |
| V104 390 light | screenshots/V104_390_light.png | screenshots/V104_390_light_menu.png | M01 |
| V104 390 dark | screenshots/V104_390_dark.png | screenshots/V104_390_dark_menu.png | M01 |
| V105 1440 light | screenshots/V105_1440_light.png | screenshots/V105_1440_light_sidebar-recolhida.png | M04 |
| V105 1440 dark | screenshots/V105_1440_dark.png | screenshots/V105_1440_dark_sidebar-recolhida.png | I02, M04 |
| V105 1280 light | screenshots/V105_1280_light.png | screenshots/V105_1280_light_sidebar-recolhida.png | M04 |
| V105 1280 dark | screenshots/V105_1280_dark.png | screenshots/V105_1280_dark_sidebar-recolhida.png | I02, M04 |
| V105 768 light | screenshots/V105_768_light.png | screenshots/V105_768_light_sidebar-recolhida.png | M04 |
| V105 768 dark | screenshots/V105_768_dark.png | screenshots/V105_768_dark_sidebar-recolhida.png | I02, M04 |
| V105 390 light | screenshots/V105_390_light.png | screenshots/V105_390_light_menu.png | M02, M04 |
| V105 390 dark | screenshots/V105_390_dark.png | screenshots/V105_390_dark_menu.png | I02, M02, M04 |

## SHA256 dos originais

| Arquivo | SHA256 manifesto e arquivo |
|---|---|
| screenshots/SYS05_1440_light.png | `b5c0c6291b88b0aa2ddb08d05a655cd8c2e8fa2c9dd0392164141bc34cfbb29e` |
| screenshots/SYS05_1440_light_sidebar-recolhida.png | `44b828e5983936f720e4e468a98eebfd7122838daf703886635840199420714e` |
| screenshots/SYS05_1440_dark.png | `547d8f671d4e0203a90fe91b54df7f439711f3bd54db33ad1d712baf7fe0fb7f` |
| screenshots/SYS05_1440_dark_sidebar-recolhida.png | `1e525491b03a710e04ba4df737123593a76e8147f5260b7815422b4b058fdaff` |
| screenshots/SYS05_1280_light.png | `f0d30fc30d4f7269ce0898bd4463d120be1051678831460619206d16e74e0b92` |
| screenshots/SYS05_1280_light_sidebar-recolhida.png | `7f4b176b6f8565bea8fd32f6d0db73c96963d019cf646743a052695a3ec104bc` |
| screenshots/SYS05_1280_dark.png | `7b23262df1b8cc62a844f7e9af88cac47afbd79d0ae45aee40e05ab8ec751fca` |
| screenshots/SYS05_1280_dark_sidebar-recolhida.png | `b7e713a9eec0acb42a059c696d070ff63b29392c352e9c77102670bced3e793b` |
| screenshots/SYS05_768_light.png | `0a579ea4e9b8598dd5d4834cc949df3e28315637cd0172b1f65a35f0363cce0c` |
| screenshots/SYS05_768_light_sidebar-recolhida.png | `2b3af0ce007616356ed4ba757b26a49f2ac26057ad65bf504578bf22220d1eeb` |
| screenshots/SYS05_768_dark.png | `d64c541ffc0ce4f650f28a4fa5e049205390fd14b85a0743a1911e9f5bc2176f` |
| screenshots/SYS05_768_dark_sidebar-recolhida.png | `6df09dce85b2a66fa6d3d72ddbff6b293ad092233d3c8ecb62f47dff32849552` |
| screenshots/SYS05_390_light.png | `8ac4fd6436cf090622f866a4faca96c545d7d8fd7e37fe64655aca25cf95ab54` |
| screenshots/SYS05_390_light_menu.png | `21f31b8d1660623b066f278b1976deb243e09346c407c440db11baac2ac5b203` |
| screenshots/SYS05_390_dark.png | `21097f32f11cdea749d88e3a806d9337d64ab47c95f1dedae0cdf08bf63993bd` |
| screenshots/SYS05_390_dark_menu.png | `bc64622904e0ebef5e99a9b4962e596d5616b50875503e3f7ba8307d6fa0a90d` |
| screenshots/ADM01_1440_light.png | `3f52c7a5a6dc47d13ce4590966ac84f938364530fa1b5a23884f1130d95b1e6c` |
| screenshots/ADM01_1440_light_sidebar-recolhida.png | `51d4b7c93e7d8b0301808635a34402d212db5ea84e3ba0be7c786662064ca42f` |
| screenshots/ADM01_1440_dark.png | `dee8899ec9643af337221929e37e460c34788070e3f5ba4160bb83bcc4c9f4d8` |
| screenshots/ADM01_1440_dark_sidebar-recolhida.png | `0e37983ec57bda5a2639f79157c931107359824502c5faace64fd0a201ee586d` |
| screenshots/ADM01_1280_light.png | `e1b129f91903765fed897c661c0c9f8f692b7673940ad8965e9596c3ca4b2f36` |
| screenshots/ADM01_1280_light_sidebar-recolhida.png | `ce5572a05000ca630dcad514487632d20447b178a9c37d35554a4afdaee29880` |
| screenshots/ADM01_1280_dark.png | `61843518c16a2469cda15dfa984db9a7453e3cb3f64c6f5e63d274609232ee77` |
| screenshots/ADM01_1280_dark_sidebar-recolhida.png | `4658957fa67feb540bb5f0ee54d990fc7744bf3bc7070369518425aa666e91f8` |
| screenshots/ADM01_768_light.png | `0c1040688f8bce0f1faf209df51a7c52159e6b41fbb344f662cdd85b8222ce5e` |
| screenshots/ADM01_768_light_sidebar-recolhida.png | `842e75404931298553eb3952c23de8cffb2b1cc9aafbbe02699c066eb24c1b7c` |
| screenshots/ADM01_768_dark.png | `2d3fd72539e6526cd539f4bf4c433587e740fa4b8250332c01825d53e1f25b88` |
| screenshots/ADM01_768_dark_sidebar-recolhida.png | `74e0f1a3d2a463e1fd5e4fa84d1b1650e9e78f0142cedf0d937b70424494c1d5` |
| screenshots/ADM01_390_light.png | `a153d8a288e8a7bf0f2b9c0a3a7e0e4660d8bee898682c7806572617b8ec5b6a` |
| screenshots/ADM01_390_light_menu.png | `eeca718f46a6d4176b84d9161461c59c69f23553a7b8933c35e69cd558d910c1` |
| screenshots/ADM01_390_dark.png | `15c0cef15bbaf0cf3fc3c77f144e906979dfed7e543ec8fc20adfa3844a1229b` |
| screenshots/ADM01_390_dark_menu.png | `f2636dee93c31b46b7a64261ca858b3c9685ae6ec5cab75d6a2ec3bfed27fc3d` |
| screenshots/V101_1440_light.png | `a8a9f5a1d2de758f82decd8290e8b0cea70334e3166c0d53dfbac31e0efbf56d` |
| screenshots/V101_1440_light_sidebar-recolhida.png | `a08a41ea74f2bea0f7053a82be208f16550dbc569f8c944fb87df2224dd57e15` |
| screenshots/V101_1440_dark.png | `f50d34914cbbaf5f81c501dce8990a3ac5b950558ffdb41ffb21446b5c6a895b` |
| screenshots/V101_1440_dark_sidebar-recolhida.png | `aa4d876ae8257126fc73467f20209dd5a1ecf0686a1539d0fc28933d5fdbe575` |
| screenshots/V101_1280_light.png | `82767e29e9d46fd7f9f46b8cedc05469674f4731d80c88bc7920e4087f00428b` |
| screenshots/V101_1280_light_sidebar-recolhida.png | `8fd5808b03a37fddc7f018263b3518c50edcbbdd0e264dd55d7f200d0dcf1338` |
| screenshots/V101_1280_dark.png | `5fa41b61f6889865747dd1b02765ff62a8ed9acb961379cd02372beaf672c3ca` |
| screenshots/V101_1280_dark_sidebar-recolhida.png | `8b7753abeccafd0c815dd99fab106d9a93e7c19dd3528a9e2568826a698882ab` |
| screenshots/V101_768_light.png | `cb69e9fff8ab30f3ced3c6b57d281618533c37a6f1b858627dca877b99da0460` |
| screenshots/V101_768_light_sidebar-recolhida.png | `19b820add8dff44437d7caeb96003bc7c239764b7bad1d7012ad6488e97d101e` |
| screenshots/V101_768_dark.png | `1aec71a635add5f790a0b2de62fab22661f983e1bdd436632dd39d343a23c3c9` |
| screenshots/V101_768_dark_sidebar-recolhida.png | `1d78c968b6065f0fdc7c0cdf5cfed9e421ed26861bfbfe6da23c4f24184e64c9` |
| screenshots/V101_390_light.png | `170e89bb9ae41fd9241cfba915601c10a85614b88c561f0ff9a92d150327c3eb` |
| screenshots/V101_390_light_menu.png | `7ff2b9153ffd6f5a50e7ad17a65fe13ed15fd294ddce258a990ed3acfb466435` |
| screenshots/V101_390_dark.png | `ff7d96942cff7378a5b1d8c6529565dea37a8e51d924c480eb3746d0c4ff0b1c` |
| screenshots/V101_390_dark_menu.png | `d4473d896b09570fadd39c6e9b5bad11807720fd8db2460984d12f5f9c8d6bee` |
| screenshots/V102_1440_light.png | `4b279efff45d821272bedec1be735fbf0937c992434c22dd9c6f89b4a306fabc` |
| screenshots/V102_1440_light_sidebar-recolhida.png | `a9336b6b39b155f53f10c2bf4942cda81f7b528dad8acf8f9cb5ae08c43091ac` |
| screenshots/V102_1440_dark.png | `e0626edcea6450766397024d71109b22a5528b7b45017a71ccb908b0242de240` |
| screenshots/V102_1440_dark_sidebar-recolhida.png | `86dfd2bb274661a783482495844962b0f66ee19464755bfc8920198dacbc560b` |
| screenshots/V102_1280_light.png | `3b7814ffa3066a3275bf2c659b1fcc6b98ab34a77abc5864332ee9c460ad689e` |
| screenshots/V102_1280_light_sidebar-recolhida.png | `22d6ff1fea6980fb523681d305e3f42f97a9c8c0dcbbd62d169c4a01dbd4de69` |
| screenshots/V102_1280_dark.png | `003093971f3f734867975aff261a26d76193efdb53d37f4319d7044c746b7c07` |
| screenshots/V102_1280_dark_sidebar-recolhida.png | `a1bfc473163878d728dd632648b78f825b461e7365a0005bed45e907a63d48eb` |
| screenshots/V102_768_light.png | `2196075bcc6fe3e86220087a682107beefd3ea407e1d6ca8a10fd2cf0715a2ce` |
| screenshots/V102_768_light_sidebar-recolhida.png | `f57fc36c6d73ad80fdb1209bdf4630e3ab16b0c17bb68c9492f8e4c4922ebfcf` |
| screenshots/V102_768_dark.png | `5148792bf4ac7cf44b72deef1596d3acaf0d7d2e1954672de47842ce9fc06a25` |
| screenshots/V102_768_dark_sidebar-recolhida.png | `2a4c46830386e4be2c3a750cd9ab6d41156fef6e018ed0400438d7db0e44eef7` |
| screenshots/V102_390_light.png | `fb80ac64f4466ce703b339f1c4d6d7b586e45bc5185a52a7a4f4517d52a55699` |
| screenshots/V102_390_light_menu.png | `3b30f14e3d85a04d0eec97ef3c8fd3a85a241e518906bd7cfde6a551b5fb5682` |
| screenshots/V102_390_dark.png | `ee6089a08c964189064e127dc3239b0b2dfe013ebd325b032d51e72255c8b9b3` |
| screenshots/V102_390_dark_menu.png | `fb2e49e883ffb2b1984633012e612e0cb50cb2c35c4bc255f9c984365f17a25d` |
| screenshots/V103_1440_light.png | `62258ed5648123a62e9e386dc1a10abfb6e187f37104a25afb4669604d43073f` |
| screenshots/V103_1440_light_sidebar-recolhida.png | `844e4386d6d7a21f195d8b9181f62da1eb7e7984a6ccc24b8ba8a217e18dad34` |
| screenshots/V103_1440_dark.png | `33b6368621eaad6aac0cd308aa79a65b25f39f28c53ec15615b6b0ee1374d9ea` |
| screenshots/V103_1440_dark_sidebar-recolhida.png | `ec83375a261cb942c75656a66ea5e4c2ec230b07a5a5fd54eb631d74c2e01177` |
| screenshots/V103_1280_light.png | `7e3d20cbf483c937e2789f88c0fe3354b1594151901882c2d00b1b846a15637f` |
| screenshots/V103_1280_light_sidebar-recolhida.png | `0a8896aeeaace1cc74983bcc5970a3a667b523cd20253797a6d42e832e5e2eed` |
| screenshots/V103_1280_dark.png | `9e8baf47851f749d62c577f3c4e30c4792558f100583a58b8457dae8412aaa5a` |
| screenshots/V103_1280_dark_sidebar-recolhida.png | `49338088182972f1826ead89030baf291b664db4a4f712201dec7134c321b9bb` |
| screenshots/V103_768_light.png | `3616c6146b4b4384b3e7d73256976ff9b98cd684390e4c976b25790e10b8858c` |
| screenshots/V103_768_light_sidebar-recolhida.png | `2195f1546773dff7b28e4925c4baae405746d28419f5ee8a9b5b8b75324eb514` |
| screenshots/V103_768_dark.png | `fea009e449f6e1074bf0fcaeb0cc6ea3728ff5f539d667b737b401370c252cde` |
| screenshots/V103_768_dark_sidebar-recolhida.png | `dbbec2a8286838d820446775776c0f3ba6739858d8d1ab4529add106eaadd515` |
| screenshots/V103_390_light.png | `d14435a0c42f87b960cf987a874b58fb6c4a84330696dd364a5d72e4c13d5e69` |
| screenshots/V103_390_light_menu.png | `1023414fe269d4abb147f9f5eb0a50c56de062697fa429c3ee06419dc541d5be` |
| screenshots/V103_390_dark.png | `db9440295bb136bf960ee392e45c210f2ba8852d6c6e7278a870d71c3ffaaa58` |
| screenshots/V103_390_dark_menu.png | `801417b25982a97ca13d77325f88a7f90bd3aa15b5ae9ad44c173f175a121ead` |
| screenshots/V104_1440_light.png | `b72cd03aa4e5f8eb72788250e18b1ba4df80a0d6a1eaa1ab6cb8abae30fd4f4a` |
| screenshots/V104_1440_light_sidebar-recolhida.png | `96dc6074f155afb4e56a39afb5cf93d5641eb4fee6d7001da5556a3092f9ce47` |
| screenshots/V104_1440_dark.png | `5f6808e810073a3dabc1377dcd8cbf885cdaeb31e7c1fc99de7e6829856ea342` |
| screenshots/V104_1440_dark_sidebar-recolhida.png | `46e061291476fc8ca2a66dcfdec69a8812146352916b92b7d67b0ef43f29b30f` |
| screenshots/V104_1280_light.png | `76ef9dbd7b18a75d5e6bff32295e0ecda6801dd6d018dbd23445b11c99b94a9d` |
| screenshots/V104_1280_light_sidebar-recolhida.png | `2bfd4b67f59e7d147a012cf71659c3826291f674c28ec746955ac987f910b20a` |
| screenshots/V104_1280_dark.png | `b3c2c07700a798b66c5081914c688db779c64b7b23ccc084f286c49525f4d08d` |
| screenshots/V104_1280_dark_sidebar-recolhida.png | `8a9d7067a79f808416960c67540654a151072cf93c2e8751cc9c6bd91047a760` |
| screenshots/V104_768_light.png | `02e2b62b3650922ce07ca4b20df6f277dc268823c03eda51b92fbf0c3a143cc2` |
| screenshots/V104_768_light_sidebar-recolhida.png | `7231150a24687b0968b00b5d8a098971ca96935571d3e1d7feab7f870b56bbdb` |
| screenshots/V104_768_dark.png | `e281672258d0cd1f31a6e2643bcaea83c9ae6d4be77f9f4795af69f09179d5bd` |
| screenshots/V104_768_dark_sidebar-recolhida.png | `a39bb5a4545da938722a90d757db640b129a0b22e823529f3f32e5a4f0328ca1` |
| screenshots/V104_390_light.png | `02e84182f713ba8dcba6f21914838b9a593bb974287715d57f0f65fdc036cf0d` |
| screenshots/V104_390_light_menu.png | `7ba81b28a1bb0db9fd2af92b266f20b171f0dfcf141b55b3b608ac6463e015ce` |
| screenshots/V104_390_dark.png | `b45c884a5a1fd2cb14672baf70184c32a1adb92258a339d0d3b6ffcfdf033f74` |
| screenshots/V104_390_dark_menu.png | `8788f9d8dc3e63ccd142c8909c849028c9e60bfae661387869ddcb5c97ceccda` |
| screenshots/V105_1440_light.png | `0c8ca105a586effa3494b075632e62c0a2885006777757dc1c07ab0f654385e7` |
| screenshots/V105_1440_light_sidebar-recolhida.png | `bbffa63dc5ae269b77922624d09448e74698aaf21fc79a1840250f631fdbb60a` |
| screenshots/V105_1440_dark.png | `a892e1e6df98575dc7b546061113cf30f0eb1bdb1b4b32331acded1dd46b3f90` |
| screenshots/V105_1440_dark_sidebar-recolhida.png | `8593f46b0ecbe7925e8e906247c149174460a62feaf01fcb4b9cc43072825467` |
| screenshots/V105_1280_light.png | `48c9a8161101e6c0deafee452230cda2cbe7190060f3d4c8521e619b02191d23` |
| screenshots/V105_1280_light_sidebar-recolhida.png | `9e2e230c73419ff13d3631f866bc90c7cce782e92dd81b6d5114331a31604107` |
| screenshots/V105_1280_dark.png | `d539a4dd86e32e8ac30a2ad9dcfc522e8e3d2bdf9e9c6430fec4394be2538229` |
| screenshots/V105_1280_dark_sidebar-recolhida.png | `5703200ddf7a542f8194ea01b7187521012f8ddfeed45bf2d66e28f4cef90ff0` |
| screenshots/V105_768_light.png | `081edf465032881648c441a0d6fdc56ce643150b714c8ccb640f5bd23af644d9` |
| screenshots/V105_768_light_sidebar-recolhida.png | `6382c4cebf73c3c38efca9736c418e569a3bfa59576480a213ebd10a55d6ed96` |
| screenshots/V105_768_dark.png | `a1506e885f5508288e5b9c11a8ee6be54cb3097fc82be85d86d83b7552257d13` |
| screenshots/V105_768_dark_sidebar-recolhida.png | `627ca6a239e4615429d418bffff40661b99de7fe29a3f2e4b58cb2051d9ff858` |
| screenshots/V105_390_light.png | `b6d9e7729e0c0fbe4a9ed504755551103f2a1509ce0633f726af91b530b11b31` |
| screenshots/V105_390_light_menu.png | `dc0708d6464e77defb5cdc1341d9e8beefc716adc82351d67fd5e07844bfc7c0` |
| screenshots/V105_390_dark.png | `277e23141cc3ae3d6e4f5890fe499b6700f78abe3eda9829c42d251255e6d150` |
| screenshots/V105_390_dark_menu.png | `01479b0ea5a09db1e82e4491c0516af04df2b08e2dd0604875b8b430d7a229d0` |

## Parecer de preservação

112 PNG originais inspecionados; podem ser preservados como evidência fiel do estado auditado, inclusive dos defeitos registrados. Não equivale a aprovação visual sem ressalvas nem certificação V1, 72 critérios ou WCAG integral.

Preservar a cadeia dos originais com o manifesto, report e DOM. Os achados I01 e I02 precisam de tratamento antes de uma aprovação visual sem ressalvas das respectivas superfícies.


---

# Revisão visual independente: documentos e competências

32 casos, 64 PNG originais inspecionados via view_image. Sem composição, edição, recaptura, navegação, login ou alteração de produto/GitHub. Todos os64 SHA256 conferem com report e SHA256SUMS; listagem integral de hashes e DOM lido em /tmp/trilha-review-documentos.json.

Achados: Important em V110390light/dark (Menu sobre Situação) e V121390dark (marca ausente no menu). Minor em V113dark nas quatro larguras (ícone calendário pouco perceptível) e V121390light (aviso estreito). Critical: nenhum observado.

| Caso | Principal original | Suplemento original | Critical | Important | Minor | Nota |
|---|---|---|---:|---:|---:|---|
| V108 1440 light | screenshots/V108_1440_light.png | screenshots/V108_1440_light_sidebar-recolhida.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V108 1440 dark | screenshots/V108_1440_dark.png | screenshots/V108_1440_dark_sidebar-recolhida.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V108 1280 light | screenshots/V108_1280_light.png | screenshots/V108_1280_light_sidebar-recolhida.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V108 1280 dark | screenshots/V108_1280_dark.png | screenshots/V108_1280_dark_sidebar-recolhida.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V108 768 light | screenshots/V108_768_light.png | screenshots/V108_768_light_sidebar-recolhida.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V108 768 dark | screenshots/V108_768_dark.png | screenshots/V108_768_dark_sidebar-recolhida.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V108 390 light | screenshots/V108_390_light.png | screenshots/V108_390_light_menu.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V108 390 dark | screenshots/V108_390_dark.png | screenshots/V108_390_dark_menu.png | 0 | 0 | 0 | Estado vazio real de proposta, com Criar proposta e abas legíveis. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V110 1440 light | screenshots/V110_1440_light.png | screenshots/V110_1440_light_sidebar-recolhida.png | 0 | 0 | 0 | Um documento sintético com filtros, metadados, versão, estado e ações legíveis; reflow sem corte. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V110 1440 dark | screenshots/V110_1440_dark.png | screenshots/V110_1440_dark_sidebar-recolhida.png | 0 | 0 | 0 | Um documento sintético com filtros, metadados, versão, estado e ações legíveis; reflow sem corte. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V110 1280 light | screenshots/V110_1280_light.png | screenshots/V110_1280_light_sidebar-recolhida.png | 0 | 0 | 0 | Um documento sintético com filtros, metadados, versão, estado e ações legíveis; reflow sem corte. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V110 1280 dark | screenshots/V110_1280_dark.png | screenshots/V110_1280_dark_sidebar-recolhida.png | 0 | 0 | 0 | Um documento sintético com filtros, metadados, versão, estado e ações legíveis; reflow sem corte. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V110 768 light | screenshots/V110_768_light.png | screenshots/V110_768_light_sidebar-recolhida.png | 0 | 0 | 0 | Um documento sintético com filtros, metadados, versão, estado e ações legíveis; reflow sem corte. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V110 768 dark | screenshots/V110_768_dark.png | screenshots/V110_768_dark_sidebar-recolhida.png | 0 | 0 | 0 | Um documento sintético com filtros, metadados, versão, estado e ações legíveis; reflow sem corte. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V110 390 light | screenshots/V110_390_light.png | screenshots/V110_390_light_menu.png | 0 | 1 | 0 | Menu fixo cobre seta e parte direita do select Situação na principal; controle parcialmente obstruído. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V110 390 dark | screenshots/V110_390_dark.png | screenshots/V110_390_dark_menu.png | 0 | 1 | 0 | Menu fixo cobre seta e parte direita do select Situação na principal; controle parcialmente obstruído. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V113 1440 light | screenshots/V113_1440_light.png | screenshots/V113_1440_light_sidebar-recolhida.png | 0 | 0 | 0 | Formulário inicial mês/ano com ajuda, cancelar e criar; sem erro/validação exercitada. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V113 1440 dark | screenshots/V113_1440_dark.png | screenshots/V113_1440_dark_sidebar-recolhida.png | 0 | 0 | 1 | Ícone calendário nativo quase indistinguível do fundo em principal e suplemento; avaliação visual, contraste não medido. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V113 1280 light | screenshots/V113_1280_light.png | screenshots/V113_1280_light_sidebar-recolhida.png | 0 | 0 | 0 | Formulário inicial mês/ano com ajuda, cancelar e criar; sem erro/validação exercitada. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V113 1280 dark | screenshots/V113_1280_dark.png | screenshots/V113_1280_dark_sidebar-recolhida.png | 0 | 0 | 1 | Ícone calendário nativo quase indistinguível do fundo em principal e suplemento; avaliação visual, contraste não medido. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V113 768 light | screenshots/V113_768_light.png | screenshots/V113_768_light_sidebar-recolhida.png | 0 | 0 | 0 | Formulário inicial mês/ano com ajuda, cancelar e criar; sem erro/validação exercitada. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V113 768 dark | screenshots/V113_768_dark.png | screenshots/V113_768_dark_sidebar-recolhida.png | 0 | 0 | 1 | Ícone calendário nativo quase indistinguível do fundo em principal e suplemento; avaliação visual, contraste não medido. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V113 390 light | screenshots/V113_390_light.png | screenshots/V113_390_light_menu.png | 0 | 0 | 0 | Formulário inicial mês/ano com ajuda, cancelar e criar; sem erro/validação exercitada. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V113 390 dark | screenshots/V113_390_dark.png | screenshots/V113_390_dark_menu.png | 0 | 0 | 1 | Ícone calendário nativo quase indistinguível do fundo em principal e suplemento; avaliação visual, contraste não medido. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V121 1440 light | screenshots/V121_1440_light.png | screenshots/V121_1440_light_sidebar-recolhida.png | 0 | 0 | 0 | Histórico vazio real, abas e importar relatórios legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V121 1440 dark | screenshots/V121_1440_dark.png | screenshots/V121_1440_dark_sidebar-recolhida.png | 0 | 0 | 0 | Histórico vazio real, abas e importar relatórios legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V121 1280 light | screenshots/V121_1280_light.png | screenshots/V121_1280_light_sidebar-recolhida.png | 0 | 0 | 0 | Histórico vazio real, abas e importar relatórios legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V121 1280 dark | screenshots/V121_1280_dark.png | screenshots/V121_1280_dark_sidebar-recolhida.png | 0 | 0 | 0 | Histórico vazio real, abas e importar relatórios legíveis. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V121 768 light | screenshots/V121_768_light.png | screenshots/V121_768_light_sidebar-recolhida.png | 0 | 0 | 0 | Histórico vazio real, abas e importar relatórios legíveis. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V121 768 dark | screenshots/V121_768_dark.png | screenshots/V121_768_dark_sidebar-recolhida.png | 0 | 0 | 0 | Histórico vazio real, abas e importar relatórios legíveis. Conteúdo reflui com sidebar aberta/recolhida sem sobreposição. BRAND01 e organização/ativa visíveis; menu MASTER/contexto/administração; foco visível no botão de expandir do suplemento. |
| V121 390 light | screenshots/V121_390_light.png | screenshots/V121_390_light_menu.png | 0 | 0 | 1 | Aviso de importação muito estreito, quebrado em cinco linhas ao lado da ação; legível, melhoria Minor. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |
| V121 390 dark | screenshots/V121_390_dark.png | screenshots/V121_390_dark_menu.png | 0 | 1 | 0 | Aviso de importação muito estreito, quebrado em cinco linhas ao lado da ação; legível, melhoria Minor. Marca não aparece visualmente no suplemento menu, apesar de brandCount=1. Marca ausente na principal com menu fechado; suplemento mostra menu MASTER e foco em Fechar menu. Auditoria parcialmente na borda inferior, sem evidência de scroll subsequente. |

## Limites

- 32 casos do estado auditado; sem executar navegação ou ações.
- Axe zero violações nos32; incomplete=1 nos24 desktop/tablet e0 nos8 mobile; não é WCAG integral.
- Teclado forward/backward passed em amostra; sem prova de todos controles ou fluxos.
- navigationVerified=true e sidebarSupplement.passed=true nos32; campo sidebarNavigation não existe no report/DOM disponibilizado.
- Sem estados de criação, envio, erro, validação ou paginação exercitados; sem contraste medido.
- BRAND01 visual incompleto em V121390dark suplemento apesar de contagem1.
- Evidência original pode ser preservada como registro do estado auditado, com ressalvas; não comprova aprovação visual irrestrita, V1, 72 critérios ou WCAG.


---

# Revisão independente Run78: V106/V107 e limites globais

Revisão somente leitura. Originais vistos com view_image: os 32 PNGs de V106/V107, quatro larguras (1440,1280,768,390), light/dark, principal e suplemento. Nenhuma imagem alterada. Os outros grupos ficam sob relatórios independentes separados, ainda não incorporados aqui.

## Integridade e contagem

ZIP SHA256 `8dc04bdef43937aea423da1721d1de51137304ded35ed9308cfaaf6da43d7081`; report SHA256 `42706b22271ba27fe4c92cc0a0eee415e44319c01a7a05f94ed84634f20dcb3a`. Conferência independente: 313 entradas SHA256SUMS, zero divergências. 208 registros únicos esperados; 104 capturados (208 PNG,104 DOM), 96 PASS_AUTOMATIZADO,8 FAIL,56 BLOQUEADO_PII,24 PRESERVADO_BASELINE,24 BLOQUEADO_FIXTURE. Sem aborto e logoutVerified=true. Fonte frontend 241dd775d14a0d2a1ec24c93ae3f655c79d3efd2; harness 2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33; deploy dpl_AoNgZRZnutXauuPsfQ2shEmUaULS. Não associar esta prova a frontend posterior.

## Achados

Important: contraste dos rótulos de badges. Todos os oito FAIL são color-contrast: V106 light nas quatro larguras possui dois nós; V107 light nas quatro larguras possui um. Imagens corroboram palidez de Situação/Criticidade, com valores legíveis. Em VisaoGeralContrato.tsx:135-139, Selo põe label text-muted-foreground dentro de bg-muted/text-foreground; BaseNormativaContrato.tsx:279 repete Situação com mesmo padrão. Correção mínima candidata é retirar apenas a classe muted desses rótulos, herdando foreground já existente. Não requer alterar paleta global, layout, estados, fonte normativa ou regras. Requer novo axe e comprovação publicada dos oito casos; este relatório não transforma FAIL em PASS.

Nenhum Critical novo visto nos 32 PNGs. Dark mantém organização visual, títulos, badges, ações e tabelas/cartões sem corte horizontal evidente. Métricas dos16 casos: h1=1, overflowX=0, errors=0, rota/sessão/org/shell/privacy verificados, HTTP200, keyboard amostral e sidebarSupplement passed=true. Isso é evidência do estado capturado, não cobertura funcional total.

Minor/seguimento issue350: em mobile390 o botão Menu fechado coincide visualmente com parte de metadados V107 e região de Contratante V106. O suplemento mostra menu deliberadamente aberto sobre o conteúdo, com Fechar menu e foco visível. Overlay aberto é comportamento normal, não prova de bug. As imagens estáticas não demonstram se botão fechado impede leitura/click persistente depois de scroll/foco. Manter issue350 aberta para essa reprodução específica, sem contar cada overlay como nova falha.

## Preservação e acessibilidade

Os96 PASS podem ser preservados como baseline automatizado parcial com identidade exata de caso, frontend/deploy/harness e arquivos abaixo, após conclusão das outras revisões visuais; não reclassificar como WCAG/V1/DoD. Somados aos24 históricos preservados são120 casos com evidência parcial, não208 concluídos. Os24 históricos conservam seus próprios SHAs e estado, sem alegar recaptura.

Dos96 PASS,70 têm axe incomplete=1,2 têm incomplete=2,24 têm0. Portanto72 casos PASS possuem revisão axe incompleta; esse número não é o checklist72 de marca. Entre os104 capturados,76 têm incomplete1,2 têm incomplete2 e26 têm0. Keyboard declara AMOSTRA_NAO_WCAG_INTEGRAL. Nenhum desses resultados certifica WCAG integral,72 critérios globais ou ausência de PII nas56 superfícies bloqueadas.

## Casos V106/V107

Arquivos relativos a /tmp/trilha-42511641527. Todos os32 PNG abaixo foram vistos no original; os16 DOMs foram conferidos quanto a correspondência de caso/estado e SHA. Valores de hash permitem comparação sem republicar conteúdo desconhecido.

| Caso | Resultado / axe incomplete | Principal SHA256 | Suplemento SHA256 | DOM SHA256 |
|---|---|---|---|---|
| V106_1440_light | FAIL / 1 | `1c84590f40c452a150bc52fb69f0cd938b6306588a98ead0855a8654e8c34278` | `256ebedba5d58aa85eeaeb102f49603992bad85512e326e13111175bc17ba10a` | `ccc840c58b58a2036ce4e1311cb31184c4f9407c4129830f4d5eba38e9548fb0` |
| V106_1440_dark | PASS_AUTOMATIZADO / 1 | `6f16d2c933779c338fa997e5a2952874ac597eb7120062528d7b67be20b1cab1` | `9df5a5daf45657d79f7c9f0bd0baee98cf3424b4afb53e9daa0dd7834f42f447` | `fb590a4e441dae023ec65bec0c1bf940da4df3d577b308df6527a47c842cd189` |
| V106_1280_light | FAIL / 1 | `c2562816aa71c8dbbe930c675a0cd3e32f4ed59f234844bdd0a323032cb7ced3` | `c37e4c97fd204b7a3ea548fe52ce26bf2e710d426c62804ecf5cd57c5e79eb9f` | `6d7758eb6f9a864c63b9ffedf7e44d8ee08c23f7ad9a5f31658280def7743e1f` |
| V106_1280_dark | PASS_AUTOMATIZADO / 1 | `4c858afaa48b6d2fe360cdeca37cc96d73dec2f5839f101ddeb10b18a828edff` | `a7c88f64c42523eb7417beac4b2de8784223a1870a62c2ce8a55b6fe83a0f96a` | `601442d414cad6c2916fa3b4dc3322e634fa63baf9a043973490f44fb6f7ccab` |
| V106_768_light | FAIL / 1 | `9c48a9d68a28222cfafc9dc17ddf0e7ae01ba1047f0f0fb290d417d4f8f815b7` | `13867b5c347711d003ba1547e65af754467da81701be4ca026e9c439a1d35dac` | `d279df5a15021e4ad7990dfff7cef351886881f71341ed8c80149d9932e95c5e` |
| V106_768_dark | PASS_AUTOMATIZADO / 1 | `a56223db40ca74a6c4dc90c1f7751787083555ff1b767a79998daeca5353b5c7` | `4b60dec7813ace9634f2a398de4075254169dfd112074a059d905b304177b36f` | `fbe6beacfbe48c3509e7c2b12b372c1f465d4c8d6de9122e49887a2d5bfa539d` |
| V106_390_light | FAIL / 0 | `159f08c5d4d2bc0646ff8d6b58308a048817afaf78c1ab596166446f2d2450b2` | `04919253d7a03e0217c83562a7904cfe4ce1beb1e6cecd48a94a95e20b5deca0` | `4a1173336c463b00ac15c0d2411fd1ddb5ccf72c42da213e677b9c06457da5ad` |
| V106_390_dark | PASS_AUTOMATIZADO / 0 | `e99e84fcc21743705d2f75d3aa302ceced7a56299d50a795fe9fce243df2289c` | `17e7abfcc684c9b9369b5edf462371b667f97d8b0a930a0d550c1a537c9991ae` | `47a406a10b3d485958eb90da35200eeb7d6bee33a8a86e4ff688529790c7e996` |
| V107_1440_light | FAIL / 1 | `497e9af386dcdf3da9faa43e183a8a75b43ed6aa122d594fe46dd6ce8cbba9b2` | `4c519a75cd768ef8c7f3e2cc0bedf55fe185c96d6416bbff651701bfe7f76c26` | `5010d893acfbfdf5c7f1d25b27ca02416d118f5143e6317c0ea7c1a3ca67e47a` |
| V107_1440_dark | PASS_AUTOMATIZADO / 1 | `f75dfc0fffcb3228f4f276de8a77e0b250499ed20c2e5a225e2dc921c3af4a3c` | `86d555ae899a1c3b912147a664a7107999e0b5be91e1b530300ebed739c31d6e` | `8e55cecd7ec4966be37b4deaf419016159373275a67bd13e0b23dd658564966c` |
| V107_1280_light | FAIL / 1 | `f8566d6d1723058d9c8a50b78c7068fb3b9ba67d19fad46142f67dd637054c22` | `fc307aa7113f7b7fea63af1e7816e8278785be311fe34a5e545191862bbd560f` | `26044ce800191f855dfe4e8ca20a55f81db72dda2e13ee51e7dd5f5c5a7c2c52` |
| V107_1280_dark | PASS_AUTOMATIZADO / 1 | `32037cca97d7c3881d93330cc51dcd39342b5bb8e68b467ac92653ee6d95acf0` | `73641a9f292b689068b644196711452b9c60aa28ab65f909650424ba4eeddf8a` | `d3a8bdf5f02fa956e5e4156395f294bee0fb90c5601181b6ecf29cf4f511b7f9` |
| V107_768_light | FAIL / 1 | `e48451a92d27ed1b7d61ad697cb403224406b270a4f7121bc48a4ff8e47870f6` | `18e7407e3e75328fb8e93b33d65e02f9aa461dc546cb2dbaf5594ac9dfca7bf9` | `23b8fdafaf63753067b5722fd7f59eb1d03878bdea247ebfa3d23bcb08594298` |
| V107_768_dark | PASS_AUTOMATIZADO / 1 | `085e6e68e1cacb548ab2e1959b55bd8098dcf47c26fb7373bb7fc422428f9460` | `10984b2a5414321dea9e1adeec4e17e6aa5c919693184e227d5fb2d561c171ab` | `03d459af08bd52e2f2fbaa10751d6011101a94b794864b48850b5cd2eddd5a44` |
| V107_390_light | FAIL / 0 | `0c53f725304a9ac34ce57ad010be22c31224b2ffa52e152b16dfbba2136d4b35` | `5c18616538407280b6bf4b5b1a5bb620b420622128a2f775d7f240f34702db42` | `a6c741e918ea815a50fb363b6683efe3e185a03a60d0dd3568a4650c60bdf43f` |
| V107_390_dark | PASS_AUTOMATIZADO / 0 | `1b2d110d0e4276e0443c16772a8d1ecdc31da454bdc317b7c3be9b1e4770b185` | `54fc8b161c633ed6a959fe7df7dfe6fb1192ec6a5724de0147728dc76a2240d0` | `59a9570e85f19ea49e50fd78fefa1cebdd16036acee5ee4086a2b7c25aa7b553` |

## Mapeamento dos72 critérios, sem certificação global

| ID | Critério | Alcance desta evidência |
|---|---|---|
| 1 | Login continua funcionando. | Evidência parcial MASTER/organização sintética e rotas visitadas; logout final verdadeiro. Não cobre todos os perfis/estados. |
| 2 | Logout continua funcionando. | Evidência parcial MASTER/organização sintética e rotas visitadas; logout final verdadeiro. Não cobre todos os perfis/estados. |
| 3 | Navegação continua funcionando. | Evidência parcial MASTER/organização sintética e rotas visitadas; logout final verdadeiro. Não cobre todos os perfis/estados. |
| 4 | Rotas continuam funcionando. | Evidência parcial MASTER/organização sintética e rotas visitadas; logout final verdadeiro. Não cobre todos os perfis/estados. |
| 5 | Permissões permanecem iguais. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 6 | Nenhuma regra de negócio foi modificada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 7 | Nenhum cálculo foi modificado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 8 | Nenhum status oficial foi modificado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 9 | Nenhuma integração foi modificada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 10 | Supabase não recebeu alteração desta tarefa. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 11 | Nenhum secret foi inserido no frontend. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 12 | Nenhuma credencial foi adicionada ao repositório. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 13 | Nenhuma RLS foi alterada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 14 | Nenhum RPC foi criado ou alterado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 15 | Nenhuma Edge Function foi criada ou alterada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 16 | Nenhuma migration foi criada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 17 | Nenhuma request nova utiliza credencial privilegiada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 18 | Security scan sem novo Critical. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 19 | Logo horizontal correta. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 20 | Logo vertical correta. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 21 | Símbolo correto. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 22 | Cores corretas. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 23 | Proporções corretas. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 24 | Nenhum SVG foi redesenhado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 25 | Nenhuma versão não oficial foi criada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 26 | Logo funciona em fundo claro. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 27 | Logo funciona em fundo escuro. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 28 | Monocromática funciona quando necessária. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 29 | 16 × 16 legível. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 30 | 32 × 32 legível. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 31 | 48 × 48 legível. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 32 | favicon.ico carregando. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 33 | Browser não apresenta ícone antigo. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 34 | 192 × 192 correto. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 35 | 512 × 512 correto. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 36 | maskable correto. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 37 | Manifest válido. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 38 | Nenhum comportamento PWA foi alterado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 39 | Desktop 1440 px correto. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 40 | Desktop 1280 px correto. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 41 | Tablet 768 px correto. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 42 | Mobile 390 px correto. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 43 | Sem overflow horizontal provocado pela marca. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 44 | Sidebar expandida correta. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 45 | Sidebar recolhida correta. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 46 | Navegação mobile correta. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 47 | Marca legível. | Evidência visual parcial das superfícies capturadas nos quatro tamanhos/dois temas; bloqueados e estados não visitados continuam pendentes. |
| 48 | Contraste adequado. | Reprovado nesta rodada: oito casos light V106/V107 color-contrast; axe incomplete e amostra de teclado impedem conclusão WCAG. |
| 49 | Nenhum logo escuro sobre fundo escuro. | Inspeção visual parcial dos32PNG V106/V107 sem incompatibilidade aparente; demais imagens dependem dos relatórios paralelos. |
| 50 | Nenhum fundo forçado incompatível com o Design System. | Inspeção visual parcial dos32PNG V106/V107 sem incompatibilidade aparente; demais imagens dependem dos relatórios paralelos. |
| 51 | SVG/imagens possuem descrição adequada quando necessária. | DOM/axe e PNG oferecem amostra; alt/nome e uso não exclusivo de cor exigem revisão dirigida, sem aprovação global. |
| 52 | Marca clicável possui nome acessível. | DOM/axe e PNG oferecem amostra; alt/nome e uso não exclusivo de cor exigem revisão dirigida, sem aprovação global. |
| 53 | Nenhuma informação funcional depende exclusivamente da cor. | DOM/axe e PNG oferecem amostra; alt/nome e uso não exclusivo de cor exigem revisão dirigida, sem aprovação global. |
| 54 | Contraste adequado. | Reprovado nesta rodada: oito casos light V106/V107 color-contrast; axe incomplete e amostra de teclado impedem conclusão WCAG. |
| 55 | Build passa. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 56 | TypeScript passa. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 57 | Lint passa. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 58 | Testes existentes passam. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 59 | Console sem erro. | errors=0 nos104 casos capturados; não cobre56PII/24fixture nem fluxos não executados. |
| 60 | Console sem log sensível. | Artefato passou catálogo de privacidade nos104; bloqueio56 impede coleta. Não é prova global de logs. |
| 61 | Sem código morto criado pela tarefa. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 62 | Sem asset duplicado desnecessariamente. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 63 | Sem hardcode visual espalhado pelos componentes. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 64 | Nenhum backend paralelo criado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 65 | Nenhuma arquitetura modificada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 66 | Nenhuma regra funcional modificada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 67 | Nenhuma tela reconstruída desnecessariamente. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 68 | Nenhum componente fora do escopo alterado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 69 | Nenhuma biblioteca desnecessária adicionada. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 70 | Design System oficial preservado. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 71 | Marca integrada ao Design System, e não criada como sistema paralelo. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |
| 72 | Git diff contém somente alterações necessárias ao BRAND-01. | Não demonstrado por PNG/DOM/runtime desta rodada; exige fonte/teste ou verificação própria. |

## Complemento de consolidação: grupo documentos

Relatório independente /tmp/trilha-review-documentos.md e ledger /tmp/trilha-review-documentos.json:64PNG vistos e32DOM lidos, V108/V110/V113/V121. Dois achados diretamente reconferidos pelo consolidador no PNG original: V110390light Menu cobre seta do select Situação, e V121390dark_menu não contém marca visível na faixa superior embora brandCount1. Para issue350, o primeiro é evidência de sobreposição de controle; não concluir ainda que scroll/foco nunca o resolve. Segundo é deficiência da evidência visual da marca, sem causa atribuída a produto ou captura. O overlay do menu aberto não é por si defeito. Minor reportados: ícone de calendário pouco perceptível V113dark e aviso estreito V121390. Manter todos os resultados automatizados com ressalvas visuais e nenhuma certificação WCAG.

Conferência adicional:26 superfícies×8 combinações únicas=208;104DOM JSON abrem, têm snapshot não vazio e identidade superfície/largura/tema correspondente ao report. Revisão visual do grupo cadastros ainda pendente no momento deste complemento.

## Consolidação final da inspeção visual208PNG

Grupo cadastros finalizado em /tmp/trilha-review-cadastros.md e JSON:56 casos112PNG originais individualmente vistos,56DOM revisados, hashes report/manifest/arquivo conferidos. Grupos somam56+32+16=104 casos e112+64+32=208PNG. Todas as imagens possuem revisão independente; a distribuição não equivale a revisão duplicada de cada imagem por este consolidador. O ledgerCSV identifica o revisor responsável.

Achados adicionais do grupo cadastros: Important tabela V101768 comprimida com colisões, e calendários V105dark nas quatro larguras quase imperceptíveis (avaliação visual, sem razão de contraste inventada). Minor: Menu390 sobre controles, editorial, cardV104768 estreito e datas mm/dd/yyyy. Nenhum Critical relatado nos três grupos. Ler notas por caso nos relatórios originais; os96PASSautomatizados contêm ressalvas visuais reais, portanto não promover a96PASSvisuais.

Conclusão de preservação: preservar96 resultados automatizados parciais com os respectivos defeitos, identidade e arquivos, além dos24baseline históricos. Continuam8FAIL de contraste,56 bloqueiosPII e24fixtures; revisão visual não transforma bloqueios em cobertura nem certifica72critérios/WCAG/V1. Contraste requer correção local e nova prova; demais Important requerem triagem/reprodução específica sem confundir menuoverlay aberto normal com falha.


---

# Run78: causas e PLAN/GATE restritos a V101/V105

Investigação independente somente leitura sobre o SRC de frontend 241dd775d14a0d2a1ec24c93ae3f655c79d3efd2 em /tmp/contaos-fixtures/src. Nenhum SRC alterado, navegador iniciado, dado ou GitHub modificado. As falhas visuais já foram comprovadas nos originais e detalhadas em /tmp/trilha-review-cadastros.md. Este documento propõe trabalho e validações; não relata correção ou teste executado.

## I01: V101, tabela a 768px

| Referência exata | Evidência no código | Implicação |
|---|---|---|
| src/components/contratantes/ListaContratantes.tsx:79 | hidden md:block | Tabela aparece por largura do viewport. |
| mesmo arquivo:80 | w-full table-fixed | A tabela respeita a largura total disponível, mas suas colunas percentuais não se ajustam ao mínimo intrínseco do conteúdo. |
| mesmo arquivo:84 | Colunas 26/18/17/13/12/14%, até linha93 | Em espaço reduzido cabeçalhos e controles excedem suas células; cabeçalhos não têm quebra forçada para palavras indivisíveis. |
| mesmo arquivo:89 | inline-flex items-center gap-1, Situação + DicaSituacao | Texto, gap e botão ficam na mesma linha. |
| mesmo arquivo:51 | DicaSituacao h-11 w-11 shrink-0 | Botão mantém44px, mesmo quando coluna Situação possui menos espaço que texto+botão. Não reduzir alvo como solução. |
| mesmo arquivo:103 | td com badge de situação, sem quebra | Badge transborda a coluna estreita em direção à data. |
| mesmo arquivo:117 | md:hidden nos cards | Cards já existentes são desativados exatamente quando o viewport chega a768px, independentemente do espaço útil. |
| mesmo arquivo:288 | main px-4 sm:px-6 lg:px-8 | Padding reduz adicionalmente a largura disponível. |
| mesmo arquivo:346 | seção p-4 sm:p-5 + bordas | Mais42px de redução horizontal a768px. |
| mesmo arquivo:300 | md:grid-cols-[1fr_14rem_auto] | Mesma dependência de viewport provoca busca muito estreita, label quebrando em várias linhas. |
| src/components/layout/ContaOSAppShell.tsx:265 | Sidebar w-56 expandida / w-20 recolhida, md:block | Reserva224px ou80px. |
| mesmo arquivo:320 | md:pl-56 / md:pl-20 no conteúdo | Largura útil muda144px ao recolher sem alterar viewport. |
| node_modules/tailwindcss/theme.css:328 | --breakpoint-md:48rem | Tailwind4.2.1 padrão, sem redefinição em styles.css. Com raiz usual16px,768px. |

Conclusão: **o breakpoint atual depende do viewport, e não da largura do AppShell ou do container**. A causa é seleção prematura da tabela somada a colunas fixas em porcentagem e conteúdo intrínseco não redutível. A768px e base16px, tabela estimada454px expandida ou598px recolhida (768−224/80−48−42). Coluna Situação recebe aproximadamente54/72px antes do padding12px, insuficiente para texto+gap+botão44px. Estimativas derivadas do CSS, não medições de layout novas. Isso explica por que o suplemento melhora o corpo, mas mantém colisão no cabeçalho.

### PLAN mínimo recomendado

1. Restringir mudança a ListaContratantes.tsx, sem mudar AppShell, consultas, semântica ou regras de negócio. Reutilizar Cards/Tabela existentes.
2. Escolher tabela ou cards pela **largura útil do container da lista** e não pelo md do viewport. Adicionar container CSS local e usar um único limiar complementar para as duas representações. Limiar inicial proposto:56rem de conteúdo útil, sujeito ao gate. Não declarar esse número certificado sem renderizar a borda. Alternativa de alteração menor por classes: usar xl para tabela/cards, mas ela desperdiça espaço com sidebar recolhida e também exige testar bordas; md→lg sozinho é insuficiente porque a1024px expandida ainda há aproximadamente694px de tabela.
3. Fazer os filtros responderem à própria largura disponível, empilhando antes de a busca ficar estreita. Limiar distinto do da tabela é aceitável. Não fixar largura mínima que gere scroll horizontal da página. Manter labels, alvo44px, tooltip e foco.
4. Não mascarar colisão com overflow:hidden, truncamento sem alternativa, redução de fonte ou diminuição do botão de ajuda.

### GATE concreto

- Mesmos dados sintéticos auditados, nome longo e CNPJ; acrescentar casos sem fantasia/documento, situação inativa e data longa, sem gravar produção.
- Screenshots principal + sidebar recolhida:1440,1280,1024,768,390, ambos temas; acrescentar viewport767/768/769 e pontos equivalentes a limiar útil−1/limiar/limiar+1 para ambos estados da sidebar. Se56rem adotado, calcular viewport a partir dos paddings em cada breakpoint, sem assumir viewport896px.
- Medir largura real do container; somente uma representação deve estar visível/acessível. As células/cabeçalhos e badge não podem intersectar conteúdo da coluna vizinha. Verificar retângulos dos elementos internos e confirmar visualmente, pois scrollWidth/overflowX=0 sozinho não detecta sobreposição interna.
- Cada cabeçalho legível; ajuda sem colisão e acionável por Tab/Enter/Escape, foco visível; link de editar acessível nas duas representações. Filtros legíveis e operáveis, sem label coberto.
- Reflow sem clipping/overlap a390px e zoom200%; sem overflow horizontal da página. Testar troca de sidebar preservando lista e filtros.
- Regressão funcional existente: src/test/contratantes.test.tsx; verificação visual real é obrigatória porque teste DOM não calcula largura ou colisões.

## I02: V105, calendário dark

| Referência exata | Evidência no código | Implicação |
|---|---|---|
| src/components/contratos/NovoContrato.tsx:63 | campo usa bg-background; sem color-scheme | Fundo do input muda pelo tema; aparência de partes nativas não recebe orientação explícita de tema. |
| mesmo arquivo:467 | input type=date início, required | Ícone é do controle nativo, não Lucide/SVG autoral. |
| mesmo arquivo:474 | input type=date término e min vinculado ao início | Mesmo problema; preservar restrição min. |
| src/styles.css:5 | dark é variante por ancestral .dark | Tema por classe, não necessariamente preferência nativa de sistema. |
| mesmo arquivo:101 | .dark redefine tokens; background na102 | Não define color-scheme nem tratamento do indicador nativo. |
| mesmo arquivo:136 | base só borda, body fonte/fundo/cor | Ausência de regra date/color-scheme em todo styles.css. |
| node_modules/tailwindcss/preflight.css:361 | Indicador calendário só recebe line-height:1 | Reset não adapta sua cor ao fundo escuro. |

Conclusão: causa fortemente sustentada é **fundo autoral dark sem sincronização da aparência nativa do date input**. O ícone quase preto visto nas quatro larguras é consistente com color-scheme efetivo light/normal. Não foi aberto navegador ou consultado computedStyle nesta investigação; portanto não afirmar computed color-scheme, razão de contraste ou comportamento de outro navegador como medidos. Este defeito **não depende de breakpoint**. O grid do formulário muda em md (NovoContrato.tsx:430), mas a classe dos dois date inputs é a mesma em todas as larguras.

### PLAN mínimo recomendado

- Aplicar orientação explícita de esquema light/dark somente aos dois date inputs V105 ou a uma classe local de date field. Usar propriedade color-scheme alinhada ao tema por classe, preservando controle nativo, labels, required, min, value, foco e mensagens.
- Evitar mudança global de .dark color-scheme neste patch mínimo: isso alteraria outras superfícies nativas sem terem sido revisadas. Se a decisão for padronizar globalmente, ampliar inventário e gate para todos input date/time/month e selects afetados.
- Não usar simples filter:invert global sobre indicadores: pode inverter duas vezes em navegadores que já adaptam o tema. Não substituir por datepicker customizado para esta correção pontual.
- mm/dd/yyyy é achado editorial separado: formato apresentado pelo controle nativo depende do navegador/locale. color-scheme não corrige locale. Não prometer que lang=pt-BR sozinho força formato visual em todos os navegadores.

### GATE concreto

- Inspecionar computed color-scheme no campo: light em light, dark em dark, inclusive quando a preferência de sistema é oposta à classe de tema. Alternar tema com input vazio e preenchido sem perder valor.
- Repetir1440/1280/768/390, ambos temas, principal e suplemento; comparar os dois indicadores com os originais, confirmando presença visual clara e sem clipping. Medir contraste do componente se for alegar requisito WCAG, sem extrapolar da imagem ou do Axe.
- Em contexto de teste isolado: Tab/Shift+Tab com foco visível; digitação e seleção nativa por mouse/teclado; valor ISO preservado, required início e min término continuam válidos; nenhuma operação de salvar em produção.
- Testar pelo menos Chromium do harness auditado. Cobertura Firefox/WebKit necessária se o produto declarar suporte a esses motores; não inferir sucesso por Chromium.
- Executar regressão src/test/novoContrato.test.tsx; esses testes verificam formulário/negócio, não renderização do indicador nativo. Screenshot real continua necessária.

## Limites e autorização

PLAN/GATE está pronto para revisão, sem implementação. Gate local/isolado e sem mutações reais. Novas capturas HML ou execução do harness dependem do workflow e da autorização do root; esta investigação não iniciou sessão nem navegador. Um resultado futuro destes dois gates não certifica V1,72 critérios ou WCAG integral e não resolve os demais achados Run78.


---

# Investigação somente leitura: Menu V110 e marca V121

Base: Run42511641527/TesteC78, frontend241dd775d14a0d2a1ec24c93ae3f655c79d3efd2, harness2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33. Revisão de originais já registrada em /tmp/trilha-review-documentos.json. Nenhuma alteração SRC/GitHub/dados, login, navegação ou recaptura. HEAD local atual7038fb10633e738b35a4104aefbb2a3f856843b8; git diff dos dois componentes investigados contra frontend auditado e do harness contra harness auditado retornou vazio.

## Evidência e causa

### V110390light/dark: Menu sobre Situação

Os PNG principais mostram Menu em x308–373/y934–984 sobre parte direita do select Situação (incluindo seta). Isso é sobreposição comprovada do estado capturado; não foi demonstrada impossibilidade permanente de operar o select com teclado ou após scroll.

Causa direta compatível no produto: src/components/layout/ContaOSAppShell.tsx:199–213 define Abrir menu como fixed bottom-4 right-4, z-50 quando fechado e md:hidden. Em viewport390×1000 o botão ocupa precisamente a região inferior direita capturada. Não participa do fluxo; o wrapper do conteúdo em :318–323 só tem min-w-0 e compensação lateral desktop. src/components/contratos/DocumentosContrato.tsx:472–536 empilha filtros em coluna no mobile; Situação é o quarto campo. Não há prevenção de interseção entre o acionador global e campos que passam sob ele durante scroll. Acrescentar apenas padding inferior não resolve sobreposição de campos intermediários no viewport.

Classificação: Important no estado capturado; limitação funcional ainda a reproduzir. Mudança ideal pertence ao shell global, não deslocamento pontual do filtro Documentos.

### V121390dark_menu: marca não pintada

No PNG suplemento original não há marca na faixa entre Fechar menu e divisor. O relatório traz sidebarSupplement.brandCount=1, mas isso não prova pixels nem imagem carregada.

Produto: AppShell:214 monta condicionalmente o diálogo; :231–238 monta img com src fixo /brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg, width131,height32, class h-8 w-auto. Não há condição por tema, rota ou V121, opacity ou carregamento lazy nesse elemento. O mesmo SVG branco sobre sidebar escura aparece nos outros sete suplementos mobile desta divisão. O SVG local contém geometria branca. O aside desktop oculto também referencia o mesmo asset, o que pode favorecer cache, mas não prova decode/pintura do novo elemento no instante da captura.

Harness: scripts/hml/authenticated-visual-audit.mjs:3029–3035 faz click, waitFor diálogo, inspectPrivacy e screenshot; depois conta img:visible. :2675–2683 salva screenshot fullPage com animations disabled; não aguarda complete/naturalWidth/decode das imagens. A espera networkidle/fence.drain de :2588–2591 ocorre na navegação/resize, antes da montagem do menu. fonts.ready e dois RAF em :2772–2778 também antecedem a abertura do suplemento. A contagem :visible não exige pixels decodificados e ocorre após o PNG, portanto pode divergir temporalmente. A interceptação verifica/resume assets (:1564–1602), acrescentando possibilidade de sincronização, mas não há log específico da imagem para diagnosticar esse caso.

Conclusão: falha visual do artefato comprovada; corrida de carregamento/decode/pintura é hipótese plausível, não causa demonstrada. Não há evidência suficiente para atribuir defeito persistente ao tema dark ou aprovar BRAND01 nesse suplemento. Preservar original; classificar causa como inconclusiva até reprodução controlada. Não propor alteração do logo/SVG/CSS com base somente nesse PNG.

## PLAN mínimo

1. Menu: preparar ajuste único do AppShell para manter acionador de navegação no fluxo de um cabeçalho móvel dedicado, com espaço reservado; se sticky, prever compensação de scroll/foco. Manter rótulo acessível, aria-expanded/controls, diálogo, Escape, foco e inert atuais. Não alterar RBAC, links, dados ou formulários.
2. Captura: preparar barreira do harness APÓS abrir menu e antes do screenshot: localizar exatamente uma marca no diálogo; aguardar complete e naturalWidth>0; aguardar decode com timeout/falha explícita; aguardar duas animações; registrar src atual, dimensões naturais/retângulo e estado de carregamento. Drenar/assert fence pós-abertura conforme API existente. Contagem/diagnóstico devem ser do estado anterior à captura. decode sozinho não substitui revisão visual do PNG.
3. Marca produto: somente se continuar ausente com asset concluído/decodificado, investigar estilo/pintura/erro de asset com evidência temporal antes de fix. Não mudar tema ou asset por inferência.

## GATE de validação proposto, ainda não executado

- Teste focado shell: a390 e767, Menu fechado não intercepta centro/borda/seta de controles interativos visíveis ao percorrer scroll de V110; incluir foco em Situação. Usar retângulos e hit-testing (elementFromPoint), além de PNG. Repetir light/dark e alturas menores que1000 para evitar ajuste baseado em um único viewport. Preservar desktop768/1280/1440 sem regressão.
- Menu: abrir/fechar, Escape, retorno de foco, Tab/Shift+Tab contendo foco no diálogo, administração/Contexto atual e scroll até Auditoria continuam operáveis. Essas checagens são específicas, não WCAG integral.
- Marca captura: falhar explicitamente diante de imagem incompleta/quebrada/decode rejeitado, em vez de PASS por :visible; validar barreira com asset retardado e com erro controlado em ambiente de teste. Só depois capturar novos PNG independentes, preservando Run78 e hashes.
- Reproduzir V121390dark menu com rede fria e quente e repetição delimitada; registrar complete/naturalWidth/decode antes de cada PNG. Se novas capturas corretas após barreira e falha antiga não reproduz, registrar provável corrida do harness, sem reescrever diagnóstico do original como produto aprovado. Se persistir com decode concluído, abrir correção produto separada baseada no novo diagnóstico.
- Comparar visualmente V110390light/dark e V121390light/dark antes/depois; confirmar logo pintado e controle desobstruído. Nenhuma execução ocorreu nesta investigação.

Evidência Run78 pode ser preservada como registro imutável do estado auditado. O caso V121390dark_menu permanece insuficiente para BRAND01 visual e o caso V110390 tem obstrução comprovada. Nenhuma certificação V1,72 critérios ou WCAG decorre desta análise.

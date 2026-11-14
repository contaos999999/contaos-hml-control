# Fase 3, BUILD-2b-2: drivers de UI, em incrementos

O titular pediu, em 14/11/2026, a execução integral do BUILD-2b-2 ("Execute integralmente").

O levantamento mostrou que o BUILD-2b-2 tem o tamanho do preparador da Trilha A. Para cada um dos 16 produtores de negócio e para o ADM01, o executor precisa de:
- fluxo de mutação na cerca;
- leituras permitidas;
- driver de UI;
- teste offline com os componentes reais.

Por isso o BUILD-2b-2 sai em PRs incrementais. Cada uma tem revisão independente por causa raiz (P0-RCA-001) e fica dentro da lista fechada da seção 7.6 do PLAN. Nenhum REQUEST da Fase 3 é criado antes do último incremento, porque uma falha na HML exige novo PLAN, BUILD e REQUEST, com nonce novo (PLAN §9, passo 6, e §12.4).

| Incremento | Conteúdo | Estado |
|---|---|---|
| 2b-2a | Fundação: obrigações M2, M3 e M-A, `runCli` com o livro, isolamento que encerra a execução, cerca de mutação ligada ao livro e âncoras da emenda 1 do PLAN | esta PR (#679) |
| 2b-2b | Sessões do MASTER e do `leitor` (login, organização e logout), criação da organização F3 (SYS04), vínculo ADM01 e releitura do RBAC | próximo |
| 2b-2c em diante | Produtores V102 a V122, em grupos, cada um com fluxo, política de duplicidade com fonte e teste offline | depois |

## 2b-2a: fundação

Arquivos:
- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`;
- este documento, `PLANO_ATIVO.json` e o prefixo do checkpoint.

Nada muda no YAML, no auditor, no preparador, em `src/**`, em `types.ts`, nas dependências, no backend ou em PROD. `F3_LEDGER.json` também não muda: continua vazio, com o mesmo SHA fixado.

### Obrigações do BUILD-2b-1 cumpridas

- **M2, proveniência amarrada à mutação.**
  - `createF3IntentBook({ ledger, provenance })` exige a proveniência completa e falha com `F3_PROVENANCE` se faltar qualquer campo.
  - `blockedF3Report({ book })` usa a proveniência do livro. Passar outra proveniência junto com o livro é divergência e falha.
  - `validateF3Report` exige proveniência completa sempre que o relatório tem eventos, inclusive quando é `BLOCKED`.
- **M3, execução do ledger ligada ao artefato.**
  - Cada execução registrada no ledger ganhou `artifactId`, `sha256` do ZIP (PLAN 7.5) e `reviewId`.
  - A entrada `PASS` herda esses três campos da execução citada e precisa ser igual a ela. Assim, há uma fonte só.
  - O revisor da PR do ledger confere os eventos contra o `F3_REPORT.json` desse artefato.
- **M-A, ramo e87 exercitado.** O teste de propriedade conta as entidades da `e87f7e68` geradas e exige que sejam mais de zero (hoje são 323), além de cobrir todos os tipos de entidade.
- **`runCli` com o livro.** A sessão saiu do `runCli` para `runF3Session({ catalogue, ledger, provenance, drive })`, testada por comportamento. Ela cria o livro, roda o driver, faz a conferência final de isolamento e, em qualquer falha, devolve o relatório parcial com o livro (eventos, envios e inventário). O `runCli` só lê, valida e grava.
- **Isolamento dos pré-requisitos.** `book.assertIsolation()` encerra a execução com `F3_ISOLATION_BREACH` em dois casos:
  - houve entidade fora da F3, em qualquer intenção, porque isso significa mutação fora do isolamento e seguir só aumentaria o dano;
  - um pré-requisito gerou entidade não isolada. Ele não tem recibo onde o critério ISOLATION o reprovaria.

  Uma entidade repetida ou uma organização duplicada vinda de principal ou de duplicidade continua no recibo e reprova o gate, mas não encerra a execução. A conferência roda em dois pontos que não dependem do driver: em todo `arm` da cerca, que é a única porta de mutação nova, e no fim da sessão. Como ela percorre todo o inventário, inclusive o histórico do ledger, uma violação de execução anterior bloqueia as seguintes, o que é coerente com o PLAN 9.6.

### Cerca de mutação ligada ao livro

`createF3MutationFence({ book })` devolve a política que o executor entrega a `installNativeFence` do auditor, por import, sem duplicar código. Não há outro parâmetro: a allowlist de leitura é sempre `requestAllowed`, e o relógio e o ID são os de produção.

- **Classificação pelo significado, não pelo texto** (`isF3Mutation`).
  - GET e HEAD nunca são mutação e vão à allowlist somente leitura do auditor. Assim, listar ou recarregar uma tabela de fluxo não congela a cerca.
  - OPTIONS nunca é mutação. Passa se a allowlist aceitar ou se for o preflight do próximo passo da intenção armada, sem selo.
  - Qualquer outro método é mutação quando vai a uma RPC de fluxo, a uma tabela, a uma Edge de fluxo, ao Storage da API ou à origem do Storage. URL malformada também cai nesse ramo.
- **Fluxos por produtor e tipo** (`F3_MUTATION_FLOWS[ordem] = { principal, prerequisito }`), com fonte no código para cada passo. Alvos: `rpc`, `table` (com a query exata do cliente), `edge` e `storage` (PUT na URL assinada, com o caminho capturado e o token opaco).
  - Hoje estão declarados: SYS04 (2), ADM01 (4, Edge de convite mais RPC), V102 (5, inserção em tabela), V103 (6), V105 (7) e V106 (8, chave da UI no meio do corpo).
  - O alvo `storage` existe e é classificado, mas ainda não há fluxo de Storage declarado. O bucket e o prefixo entram com a fonte no código, junto com os drivers de V110, V111 e V115. O TUS não é suportado: se a Edge pedir envio resumível, a cerca bloqueia com `F3_UPLOAD_RESUMABLE`.
- **Corpo pela forma canônica.** Chaves ordenadas em todos os níveis e arrays na ordem, igual ao padrão do preparador. Vagas `f3Slot("uuid"|"path", nome)` marcam os valores gerados em tempo de execução: a chave de idempotência da UI e o ID devolvido por um passo anterior, como o usuário do convite no ADM01.
  - Uma vaga só pode ficar num campo `free` de topo do passo, declarado com fonte.
  - A primeira ocorrência captura o valor; as seguintes precisam ser iguais.
  - Os valores capturados saem em `settle().slots`.
- **Referências só do inventário.** Todo UUID literal do corpo armado, inteiro ou dentro de texto, em qualquer nível, precisa ser a organização F3 ou uma entidade `organizacao` ou `registro` do livro. Uma referência a organização, contrato ou registro alheio falha em `arm` com `F3_FOREIGN_ORG` (PLAN 9.3).
- **Regra do livro ao armar.** `arm` chama `book.check`, que roda a mesma `applyEvent` sobre uma cópia do estado. Tipo, duplicidade, pré-requisito antes da organização e principal repetida falham ao armar, e não no clique. `producerOrder` precisa ser inteiro e chave própria de `F3_MUTATION_FLOWS`.
- **Reenvio depois de readback.** `arm({ resendOf })` reaproveita a intenção, e o primeiro envio vira `book.resend`, contando um envio. A chave da UI vai como literal, com o valor capturado antes.
- **Selo antes da saída.** A primeira requisição da intenção sela no livro antes de sair. Se o livro recusa, a requisição é bloqueada e nada conta.
- **Resposta.** No estágio RESPONSE, a resposta de um passo admitido precisa ter o mesmo ticket, a mesma URL, o mesmo método e o mesmo corpo canônico.
- **Desvio congela a cerca.** Qualquer desvio bloqueia a requisição e congela a cerca; a cerca nativa encerra o contexto em qualquer recusa.
- **Desfecho pelo driver.** `confirm`, `rejected` ou `uncertain` é decidido pelo driver, pela UI e pela releitura. `settle` informa se algo saiu (`sealed`) e se o fluxo terminou (`complete`).

### Decisões de causa raiz

- **Desfecho fora da cerca.** A cerca nativa não entrega à política o status da resposta, nem o corpo da resposta da API. Inferir o desfecho ali seria uma segunda fonte de verdade. Por isso a cerca só decide o que sai, e o desfecho fica com o driver, registrado no livro.
- **Selo na primeira requisição, com ID do harness.** Selar só na RPC de negócio deixaria passos anteriores (a Edge de convite, o upload) saírem sem registro. A chave gerada pela UI só é conhecida no envio, então o `requestId` do livro é o do harness, e a chave da UI vem nas vagas para a releitura.
- **Política de duplicidade.** `F3_DUPLICATE_POLICY` ainda não foi preenchida para o SYS04. O `23505` vira "duplicado" em `src/lib/organizacao/criarOrganizacaoDados.ts:53`, mas só há unicidade se o corpo trouxer CNPJ. A política entra no 2b-2b, junto com o corpo do driver que define o CNPJ.

### Revisão independente R1 (HEAD `ec69e0e`): REQUEST_CHANGES, corrigido por classe

| Grupo | Causa raiz | Correção que fecha a classe |
|---|---|---|
| A, Maior | Passo identificado pela forma do texto (URL sem método, `JSON.stringify` com ordem de chaves, chave da UI sempre no fim, OPTIONS como passo, modelo sem URL dinâmica). Pior que a referência do preparador. | Classificação por destino e método; corpo canônico com vagas em qualquer posição; OPTIONS sem selo; alvo `storage` no modelo. A proveniência também passou a ser comparada campo a campo (A5). |
| B, Maior (reincide a causa 1 da #658) | A cerca reimplementava fora do livro as regras do selo e o vínculo com a organização. | `book.check` com a mesma `applyEvent`; UUIDs só do inventário ou em vaga declarada; `resendOf` pelo livro. |
| C, Maior (reincide a causa 2 da #658) | Allowlist, relógio e ID escolhidos por quem chama. | A cerca só recebe `{ book }`; os testes usam `t.mock.method` e o `requestAllowed` real. |
| D, Maior | O oráculo dos testes vinha da implementação. | Corpos na ordem do produto (SYS04, V106 com a chave na 4ª posição, ADM01, V102); teste de propriedade da cerca (300 cenários com chaves embaralhadas e leituras intercaladas); `runF3Session` testado por comportamento. Sete mutações foram conferidas e todas derrubam a suíte: ordem de chaves, método ignorado, resposta sem corpo, `arm` sem isolamento, `arm` sem `check`, sem inventário e sessão sem conferência final. |
| E, Menor | O isolamento dependia de o driver lembrar. | Conferência em todo `arm` e no fim da sessão. |
| M-1 a M-3, Menores | Comentário de M3 divergente do PLAN; documento descrevia mais do que o modelo cobria; RESPONSE sem corpo. | Comentário e documento alinhados ao PLAN 7.5; esta seção reescrita; RESPONSE confere o corpo canônico. |

**Falha nova achada durante a correção, mesma rodada.** O teste M4 do 2b-1 copiava `node_modules` para um diretório temporário a cada execução e nunca o apagava. Isso encheu o disco no meio da verificação. A correção (`t.after` com remoção) entrou em todos os testes que criam diretório temporário.

### Revisão independente R2 (HEAD `af50cff`): REQUEST_CHANGES

Os grupos C, D, E e G foram corrigidos na própria R2. Os grupos A, B e F dependiam da emenda 1 do PLAN (§12, PR #678, merge `20d4ad9`) e do levantamento campo a campo (`F3_FLUXOS_PRODUTORES.md`). Eles foram tratados na R3, descrita abaixo.

**Causa raiz comum (NR-008).** A cerca estava sendo desenhada antes de se levantar o fluxo de rede de cada produtor. A barreira agora é dupla: o levantamento vem antes de qualquer fluxo, e um teste liga cada fluxo declarado a uma linha do levantamento.

### R3: emenda 1 aplicada ao executor (HEAD desta PR)

Este incremento declara os fluxos das ordens 2 a 8: SYS04, ADM01, V102, V103, V105 e V106. Os fluxos das ordens 9 a 20 entram com os drivers, do 2b-2c em diante. O teste da barreira guarda a lista fechada das linhas do levantamento ainda sem fluxo, e essa lista tem de encolher a cada incremento.

| Item da emenda ou da R2 | O que o código faz neste incremento |
|---|---|
| Âncoras (§12.2 e §12.1) | `F3_BUDGET` = 60 no total, 40 por execução, 39 previstas. `F3_MAX_PREREQUISITES` = 11. `F3_MAX_EVENTS_PER_RUN` = 9 × 60 |
| A, posição `inventario` | Cada passo declara `inventory`: o campo e a ordem do produtor que criou a entidade. `arm` exige a organização F3 ou um `registro` isolado criado por aquela ordem. Vale para V103, V105 e V106. Valor errado congela a cerca e falha com `F3_FOREIGN_ORG` |
| A, posição `derivado` (versão esperada) | `observeVersion` registra a versão lida pela UI do MASTER, na organização F3, para o contratante (V103) e para o contrato (V106). `arm` exige `p_versao_esperada` igual à versão observada (`F3_VALUE_ORIGIN`). Uma leitura atrasada não substitui uma versão mais nova |
| A, posição `gerado_ui` (V106) | A chave da UI não pode ser a e87, a organização F3, uma entidade do inventário, um `requestId` nem uma chave já usada por outra intenção |
| B, reenvio | Evento `bind` no livro para o V106, com o SHA-256 do corpo canônico e o da chave. O reenvio exige o mesmo corpo. Ações sem chave (ordens 2, 5, 6, 7, 14, 16, 18 e 20, e os pré-requisitos de V118 e V119) nunca são reenviadas, só relidas (`F3_UNCERTAIN_RESEND`) |
| §12.3, TUS | Tentativa de envio resumível congela a cerca, e a sessão encerra com `F3_UPLOAD_RESUMABLE` |
| §12.4, esperas | `F3_WAIT_POLICIES` (W1 a W5, prazos e códigos) e `observeF3Wait`: uma leitura por chamada, com prazo contado do selo. O resultado é `READY`, `PENDING` ou `BLOCKED` com o código da espera |

**Limites deste incremento, que viram obrigação dos seguintes:**
- O vínculo (`bind`) e a regra da chave da UI estão escritos só para o V106. Os fluxos com chave das ordens 9 a 20 e o ADM01 precisam da mesma regra quando seus drivers entrarem. A extensão deve ser por regra geral, não por produtor.
- O modelo de fluxo tem um único pré-requisito por produtor. A §12.1 pede uma ação própria para cada um dos 11. O modelo precisa mudar antes do primeiro driver com mais de um pré-requisito (V107, V108 e V109).
- A variante do ADM01 sem convite e a origem `usuario_sintetico` entram no 2b-2b, com o driver do ADM01.
- O bloco de upload (Edge, Storage e confirmação), o caminho do Storage restrito à organização F3 e as entidades relacionadas entram com V108, V110, V111, V115 e V122.
- Produtores que atualizam uma entidade existente (V103, V106, a publicação de V108, a aprovação e a aplicabilidade de V107) confirmam um ID já inventariado. O livro hoje classifica isso como `entidade_repetida`, que reprova o isolamento. A correção entra antes do primeiro driver de atualização.

Um redesenho alternativo, que cobre esses limites com 30 fluxos e origem tipada por posição, está preservado na branch `backup/f3-b2b2a-redesenho-r3-local`. Ele não foi integrado, por decisão do titular em 14/11/2026 ("Manter a versão remota"), e serve de referência para os incrementos seguintes.

### §12.6 do PLAN: onde cada teste RED está

| RED da §12.6 | Teste neste incremento | Fica para |
|---|---|---|
| Espera vencida ou recusada, sem reenvio | "espera vencida ou recusada afeta só o dependente"; "prazos e códigos das cinco esperas são fixos" | drivers (2b-2c) |
| Edge pede TUS | "tentativa TUS bloqueia a sessão com o código canônico" | |
| Upload dentro da ação | | 2b-2c, com o bloco de upload |
| 41ª intenção e 12º pré-requisito | testes de orçamento e de tipos de intenção | |
| Origem não declarada | testes de V103, V105 e V106 (inventário, versão e chave) | outro usuário no ADM01 (2b-2b); caminho do Storage (2b-2c) |
| Reenvio de produtor sem chave | "ações sem chave rejeitam reenvio no livro após readback"; "SYS04 sem chave só permite reconciliar após envio incerto" | |
| Fluxo sem linha ou linha sem fluxo | "(NR-008): cada fluxo declarado tem linha no levantamento e cada linha tem fluxo ou incremento declarado" | |

### Obrigações da review 5906090998 (R2 da #678)

- **M1:** cumprida no levantamento, revisão 3 (V115 enfileira o processamento documental).
- **M2:** `observeF3Wait` devolve `BLOCKED` com o código de falha quando a leitura é `failed`. O driver de W3 mapeia `pode_revisar` falso para `failed` (2b-2c).
- **M3:** o NR-008 passa a `REINCIDENCIA` nesta PR, com `novos_testes`. Se a #679 for fechada sem merge, vale a regra de reversão do checkpoint.
- **M4:** tabela do levantamento ordenada; os drivers de V110 e V111 não dependem da contagem de documentos (2b-2c).

### Testes

- `integracao-v1-fase3.test.mjs`: 69 testes, todos verdes.
- `eslint` e `prettier --check` limpos nos dois scripts.

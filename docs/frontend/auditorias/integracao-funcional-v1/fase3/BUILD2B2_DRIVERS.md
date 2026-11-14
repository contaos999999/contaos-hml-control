# Fase 3, BUILD-2b-2: drivers de UI, em incrementos

O titular pediu, em 14/11/2026, a execução integral do BUILD-2b-2 ("Execute integralmente").

O levantamento mostrou que o BUILD-2b-2 tem o tamanho do preparador da Trilha A. Para cada um dos 16 produtores de negócio e para o ADM01, o executor precisa de:
- fluxo de mutação na cerca;
- leituras permitidas;
- driver de UI;
- teste offline com os componentes reais.

Por isso o BUILD-2b-2 sai em PRs incrementais. Cada uma tem revisão independente por causa raiz (P0-RCA-001) e fica dentro da lista fechada da seção 7.6 do PLAN. Nenhum REQUEST da Fase 3 é criado antes do último incremento, porque o nonce `integracao-v1-fase3-rel-20261113-r1` é único e uma falha na HML exige novo PLAN, BUILD e REQUEST (PLAN 9.6).

| Incremento | Conteúdo | Estado |
|---|---|---|
| 2b-2a | Fundação: obrigações M2, M3 e M-A, `runCli` com o livro, isolamento que encerra a execução e cerca de mutação ligada ao livro | esta PR |
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
  - Hoje estão declarados: SYS04 (2), ADM01 (4, Edge de convite mais RPC), V102 (5, inserção em tabela) e V106 (8, chave da UI no meio do corpo).
  - O alvo `storage` existe e é classificado, mas ainda não há fluxo de Storage declarado. O bucket e o prefixo entram com a fonte no código, junto com os drivers de V110, V111 e V115. O TUS não é suportado: se a Edge pedir envio resumível, a cerca bloqueia.
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

### Revisão independente R2 (HEAD `af50cff`): REQUEST_CHANGES, correção em andamento

A R2 confirmou que os grupos A (forma do texto), C, D e E da R1 foram fechados no que foi apontado, e achou sete grupos novos.

**Causa raiz comum aos grupos A e B da R2 e aos grupos A e B da R1.** A cerca estava sendo desenhada antes de se levantar o fluxo de rede de cada produtor. Cada rodada achava, na leitura do produto, uma origem de valor ou um passo que o modelo não previa. Por isso a correção deles não é um remendo por caso. Primeiro vem o levantamento completo em `F3_FLUXOS_PRODUTORES.md`; depois, um único redesenho contra ele. O levantamento mostrou que o PLAN precisa de emenda (pré-requisitos, orçamento por execução e uploads), e essa decisão é do titular.

| Grupo R2 | Severidade | Estado |
|---|---|---|
| A: origem dos UUIDs sem tipo (vaga aceita qualquer UUID; referências derivadas de V107 e V117 recusadas; caminho do Storage sem conferência) | Maior | Pendente: redesenho contra o levantamento, depois da emenda do PLAN |
| B: reenvio como repetição do primeiro envio; chave capturada fora do livro; ADM01 repetido sem convite | Maior | Pendente: mesmo redesenho, com evento no livro para as chaves capturadas e variantes de fluxo declaradas |
| C: congelamento e intenção ativa por objeto cerca | Maior | **Corrigido.** Uma cerca por livro (`F3_FENCE_DUPLICATE`); o congelamento é do livro, que deixa de selar e reenviar (`F3_FENCE_FROZEN`); `runF3Session` encerra com `F3_FENCE_FROZEN`; `f3ReadOnlyPolicy` para o contexto do `leitor` |
| D: sessão sem prazo e parcial perdido em job morto | Maior | **Corrigido.** Prazo fixo `F3_SESSION_DEADLINE_MS` de 40 minutos; prazo e cancelamento (SIGTERM e SIGINT) congelam o livro e devolvem o parcial; o processo sai depois de gravar os artefatos. Obrigação para o 2b-2b: testar `runCli` com driver que gere eventos |
| E: asserções que passavam por motivo errado | Menor | **Corrigido.** Recusas isoladas com a chave em vaga, inclusive UUID aninhado em array; reutilização de ticket num fluxo de dois passos; vaga repetida com outro valor; faixas de fonte do ADM01 corrigidas e isenção retirada |
| F: documento descreve mais que o código | Menor | Pendente junto com A e B |
| G: catálogo validado tarde; allowlist de leitura como dependência implícita; `check` sem chaves estritas | Menor | **Corrigido.** Catálogo do módulo conferido antes do livro; invariante de carregamento (nenhuma RPC produtora, nem as variantes de cadastro, aceita pela allowlist em POST); `check` estrito |

**Prova de mutação desta rodada.** São 15 mutantes. Catorze derrubam a suíte, entre eles os M3, M4 e M5 do parecer, a cerca duplicada, o livro congelado que ainda sela, o catálogo tardio e o leitor que aceita mutação. O único que sobrevive é retirar o congelamento dentro do temporizador do prazo. Ele é equivalente na prática, porque o `catch` da sessão congela o livro em seguida; o congelamento no temporizador fica como defesa, para fechar a janela antes do `catch`.

### Testes

- `integracao-v1-fase3.test.mjs` tem 55 testes, todos verdes. Dezenove são novos neste incremento: M2, M3, isolamento, `runF3Session`, os da cerca (opções, leitura real, envio único com preflight, desvios, regra do livro, vagas e inventário, fluxo de dois passos e tabela, reenvio, propriedade), o dos fluxos com fonte conferida no arquivo e cinco da R2 (C, C na sessão, D, G e E).
- Nenhum teste deixa diretório temporário no disco.
- `eslint` e `prettier --check` estão limpos nos dois scripts.

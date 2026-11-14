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
- **Referências só do inventário.** Todo UUID literal do corpo armado, inteiro ou dentro de texto, em qualquer nível, precisa ser a organização F3 ou uma entidade `organizacao` ou `registro` do livro (`F3_FOREIGN_ORG`). As posições declaradas em `inventory` e `derived` têm regra própria, descrita na seção R4.
- **Regra do livro ao armar.** `arm` chama `book.check`, que roda a mesma `applyEvent` sobre uma cópia do estado. Tipo, duplicidade, pré-requisito antes da organização e principal repetida falham ao armar, e não no clique. `producerOrder` precisa ser inteiro e chave própria de `F3_MUTATION_FLOWS`.
- **Reenvio depois de readback.** `arm({ resendOf })` reaproveita a intenção e arma o mesmo corpo, com as vagas de novo. O primeiro envio grava `resend` e o vínculo numa só transação e conta um envio. O livro exige que o vínculo do reenvio seja idêntico ao original.
- **Selo e vínculo antes da saída.** A primeira requisição da intenção grava o selo e o vínculo do passo no livro, numa só transação, antes de sair. Os passos seguintes gravam o vínculo. Se o livro recusa, a requisição é bloqueada e nada conta.
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

### R3 (HEAD `6b9aecf`): REQUEST_CHANGES, review 5906840506

A R3 aplicou a emenda aos fluxos das ordens 2 a 8, mas a revisão achou quatro causas:
1. **Bloqueante:** o vínculo e o reenvio com o mesmo corpo estavam na cerca, não no livro, e o `bind` podia ser removido do relatório sem o validador perceber.
2. **Importante:** o passo não declarava a origem por posição. Havia `if` por produtor e posições sem tipo no ADM01 e no V102.
3. **Importante:** 16 de 38 mutantes sobreviviam, e o TUS não era reconhecido no preflight.
4. **Importante:** este documento afirmava mais do que o código fazia.

### R4: correção por classe (HEAD desta PR)

Este incremento declara os fluxos das ordens 2 a 8: SYS04, ADM01, V102, V103, V105 e V106. Cada afirmação abaixo cita o teste que a prova e os mutantes que morrem quando a regra é retirada. Os nomes dos testes começam com "F3 R3 RED", e os mutantes estão listados na seção "Prova de mutação".

| Regra (onde vive) | Teste | Mutantes |
|---|---|---|
| Cada passo que sai gera um `bind` no livro: SHA-256 do corpo canônico, SHA-256 de cada valor de vaga e as referências usadas. Vale para qualquer fluxo, sem condição por produtor (`bindIntent`, em `applyEvent`) | "(1): o vínculo é regra do livro…" | R06, R11, R12, R32 |
| Selo (ou reenvio) e vínculo entram numa só transação do livro (`apply` com vários eventos) | "intenção armada sai uma vez…"; "(1)…" | R32 |
| Desfecho (`confirm`, `reject`, `uncertain`) só com vínculo no envio corrente. Confirmação só com todos os passos do fluxo declarado | "(1)…"; "(1 e 2): valor gerado…" | R04, R05 |
| Reenvio: só ação com chave, uma vez, e com vínculo idêntico ao original (corpo, vagas e referências) | "(1)…"; "V106 preserva a chave no reenvio"; "V106 recusa chave nova no reenvio"; "ações sem chave rejeitam reenvio…" | R01, R02, R03 |
| O resumo de cada intenção expõe o SHA-256 dos vínculos. Remover ou trocar um `bind` no relatório quebra o replay | "(1)…" | R17 |
| Valor de vaga (chave da UI ou ID capturado) é novo para o livro: não é a e87, a organização F3, entidade do inventário, `requestId` (inclusive o da própria intenção) nem valor de outra intenção | "(1 e 2): valor gerado…"; "(2): na cerca, ADM01 e V102…" | R07, R08, R09, R10 |
| Posição `inventory`: a organização F3, ou um `registro` isolado criado pelo produtor declarado. Declarada em todos os passos das ordens 4 a 8 | "(2): origem por posição dirigida pela declaração…" | R13, R14, R15, R36 |
| Posição `derived` (versão esperada de V103 e V106): refere-se à entidade da posição de inventário declarada e fica registrada no vínculo. A cerca exige que seja a versão que a UI do MASTER leu por último na organização F3 | "(2)…declaração…"; "(2 e 3): versão observada…" | R16, R18, R19, R22 a R25, R37 |
| `arm` simula o selo e os vínculos no próprio livro. Toda recusa de origem (`F3_FOREIGN_ORG` ou `F3_VALUE_ORIGIN`) congela a cerca | "(2): na cerca…"; "vaga da UI em qualquer posição…" | R20, R21 |
| TUS: bloqueado com `F3_UPLOAD_RESUMABLE` desde o preflight OPTIONS, em qualquer método e nas duas origens | "(3): TUS bloqueado desde o preflight…" | R26, R27 |
| Esperas: `observeF3Wait` faz uma leitura por chamada e devolve `READY`, `PENDING` ou `BLOCKED` com o código da espera. O prazo vale antes e depois da leitura. O instante do selo é informado pelo driver, e um instante no futuro é recusado | "(3)…"; "espera vencida ou recusada…"; "prazos e códigos das cinco esperas são fixos" | R28, R29 |
| Âncoras: 40 por execução, 11 pré-requisitos | testes de orçamento e de tipos de intenção | R30, R31 |
| Barreira do NR-008: a linha do levantamento é lida inteira (rótulo, alvo, posições tipadas e coluna da chave no reenvio, conferida contra o livro nas 30 linhas). Linha sem fluxo só na lista fechada, por linha | "(NR-008): cada fluxo declarado tem linha…" | R33, R34, R35 |

**Mudança de formato.** O evento `bind` passou a ter `step`, `bodySha256`, `slots` e `refs`. Cada intenção do resumo ganhou o campo `binds`. O teto de eventos por execução foi a (8 + 2 × 4) × 60 = 960. O ledger está vazio e nenhum relatório foi emitido, então não há migração.

### Prova de mutação da R4

São 37 mutantes, um por vez, numa cópia de trabalho separada. Os 37 derrubam a suíte.

| Mutantes | Regra retirada |
|---|---|
| R01, R02, R03 | reenvio de ação sem chave; segundo reenvio; vínculo do reenvio diferente |
| R04, R05, R06 | desfecho sem vínculo; confirmação sem todos os passos; vínculo fora de ordem |
| R07 a R10 | vaga igual a entidade, a `requestId`, à e87 ou a valor de outra intenção |
| R11, R12 | número de vagas e posições de referência livres |
| R13 a R16 | inventário sem produtor de origem, sem exigir registro, sem conferir a organização; versão em posição errada |
| R17 | resumo sem o hash dos vínculos |
| R18, R19 | versão: basta existir observação; sem observação |
| R20, R21 | recusa de origem sem congelar; `arm` sem simular no livro |
| R22 a R25 | `observeVersion`: outra organização, resposta não 200, sem filtro da organização, leitura atrasada |
| R26, R27 | TUS só na origem da API; TUS sem código próprio |
| R28, R29 | espera sem prazo depois da leitura; selo no futuro |
| R30, R31 | 12 pré-requisitos; 41 por execução |
| R32 | cerca sem gravar o vínculo |
| R33, R34, R35 | levantamento: outro RPC na linha do V103; V106 marcado sem chave; linha da variante do ADM01 removida |
| R36, R37 | V102 sem `inventory`; V103 sem `derived` |

Dois ramos redundantes saíram do código durante a prova, porque a regra já os garantia: a exigência de vínculo registrado no reenvio (o desfecho incerto já exige vínculo) e a organização F3 na lista de valores conhecidos (ela já está entre as entidades).

### Limites deste incremento, com critério de aceite

- **Fluxos das ordens 9 a 20, bloco de upload, caminho do Storage e entidades relacionadas.** Entram com os drivers (2b-2c). Aceite: cada linha sai da lista fechada do teste da barreira quando o fluxo é declarado.
- **Um fluxo de pré-requisito por produtor.** O teste da barreira já reprova um fluxo de pré-requisito sem linha própria. Aceite: antes do primeiro driver com pré-requisito, o modelo passa a ter uma ação por linha do levantamento.
- **Variante do ADM01 sem convite e origem `usuario_sintetico`.** Entram no 2b-2b. Até lá, o reenvio do ADM01 só é aceito com os mesmos vínculos do envio original (mesmas chaves e mesmo usuário).
- **Produtores de atualização** (V103, V106, a publicação de V108, a aprovação e a aplicabilidade de V107). Hoje, confirmar uma entidade já inventariada grava `entidade_repetida`, e os casos de V103 e V106 não fecham em PASS (`F3_ISOLATION`). O comportamento vem do 2b-1 e falha fechado. Aceite, antes de qualquer driver de atualização: a ação declara a entidade que atualiza, por regra geral em `applyEvent`, `recordEntity`, `crossCheck` e no critério ISOLATION. O relatório de referência tem de fechar em PASS para os produtores 6 e 8, com a propriedade do livro estendida.
- **Observação de versão.** A leitura fica na memória da cerca, e a referência usada (entidade e versão) fica registrada no vínculo. A cerca confia no objeto de resposta entregue pelo driver. É defesa contra erro do driver, não contra o driver (M-2).
- **O que o replay prova.** O replay prova que a história é consistente com as regras. Uma reescrita coerente de eventos e resumo não é detectável por ele. A autenticidade do artefato vem do SHA-256 do ZIP no ledger (M3 do 2b-1).

Um redesenho alternativo, com 30 fluxos, está preservado na branch `backup/f3-b2b2a-redesenho-r3-local`. Ele não foi integrado, por decisão do titular em 14/11/2026 ("Manter a versão remota"), e serve de referência para os incrementos seguintes.

### §12.6 do PLAN: onde cada teste RED está

| RED da §12.6 | Teste neste incremento | Fica para |
|---|---|---|
| Espera vencida ou recusada | "espera vencida ou recusada devolve o código da espera" e "(3)…" (só a primitiva) | caso dependente `BLOCKED` e independentes seguindo: drivers (2b-2c) |
| Edge pede TUS | "(3): TUS bloqueado desde o preflight…" | |
| Upload dentro da ação | | 2b-2c, com o bloco de upload |
| 41ª intenção e 12º pré-requisito | testes de orçamento e de tipos de intenção | |
| Origem não declarada | "(2)…" (três testes) e os testes de V103, V105 e V106 | outro usuário no ADM01 (2b-2b); caminho do Storage (2b-2c) |
| Reenvio de produtor sem chave | "ações sem chave rejeitam reenvio no livro após readback"; "SYS04 sem chave só permite reconciliar após envio incerto" | |
| Fluxo sem linha ou linha sem fluxo | "(NR-008)…" | |

### Obrigações registradas

- **Da review 5906090998 (R2 da #678):** M1 e M4 cumpridas no levantamento, revisão 3. M2: o driver de W3 mapeia `pode_revisar` falso para `failed` (2b-2c). M3: o NR-008 está em `REINCIDENCIA` nesta PR.
- **Da review 5906840506 (R3 desta PR):**
  - M-1: o ouvinte do driver trata a rejeição de `observeVersion` quando a resposta não é JSON (2b-2b).
  - M-2: registrada nos limites.
  - M-3: cumprida (mutante R02).
  - M-4: o teto de 11 pré-requisitos conta os rejeitados e abandonados de execuções anteriores. Avaliar na emenda da recuperação.
  - M-5: cumprida no checkpoint.
  - M-6: os pareceres R1 e R2 não foram publicados como review na #679. O resumo deles está neste documento.

### Testes

- `integracao-v1-fase3.test.mjs`: 75 testes, todos verdes.
- `eslint` e `prettier --check` limpos nos dois scripts.

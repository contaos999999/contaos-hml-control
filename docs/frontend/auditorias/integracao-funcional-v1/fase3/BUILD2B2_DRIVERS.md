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
  - Cada execução registrada no ledger ganhou `artifactId`, `sha256` e `reviewId`.
  - A entrada `PASS` herda esses três campos da execução citada e precisa ser igual a ela. Assim, há uma fonte só.
  - O revisor da PR do ledger confere os eventos contra o `F3_REPORT.json` desse artefato.
- **M-A, ramo e87 exercitado.** O teste de propriedade conta as entidades da `e87f7e68` geradas e exige que sejam mais de zero (hoje são 323), além de cobrir todos os tipos de entidade.
- **`runCli` com o livro.** O livro é criado logo depois do ledger validado. Qualquer falha posterior grava o relatório parcial com o livro, e esse relatório carrega eventos, envios e inventário.
- **Isolamento dos pré-requisitos.** `book.assertIsolation()` encerra a execução com `F3_ISOLATION_BREACH` em dois casos:
  - houve entidade fora da F3, em qualquer intenção, porque isso significa mutação fora do isolamento e seguir só aumentaria o dano;
  - um pré-requisito gerou entidade não isolada. Ele não tem recibo onde o critério ISOLATION o reprovaria.

  Uma entidade repetida ou uma organização duplicada vinda de principal ou de duplicidade continua no recibo e reprova o gate, mas não encerra a execução. O driver chama a conferência depois de cada confirmação.

### Cerca de mutação ligada ao livro

`createF3MutationFence({ book })` devolve a política que o executor entrega a `installNativeFence` do auditor, por import, sem duplicar código.

- **Leituras** passam pela allowlist somente leitura do auditor (`requestAllowed`).
- **Mutação conhecida** é qualquer URL de passo de `F3_MUTATION_FLOWS`, de qualquer produtor. Ela nunca é decidida pela allowlist de leitura e só passa se cumprir tudo isto:
  - pertence à intenção armada;
  - é o próximo passo do fluxo do produtor;
  - tem a URL exata, inclusive a query;
  - é um POST com corpo JSON exatamente igual ao armado;
  - quando a UI gera a chave de idempotência, ela vem como UUID e é devolvida em `settle`;
  - chega dentro do prazo de 60 segundos.
- **Selo antes da saída.** A primeira requisição do fluxo sela a intenção no livro antes de sair, porque toda tentativa enviada conta no orçamento. Se o livro recusa o selo, a requisição é bloqueada e nada conta.
- **Organização alheia** nunca é armada: corpo com `p_id_organizacao` ou `id_organizacao` diferente da organização F3 falha em `arm`.
- **Desvio congela a cerca.** Qualquer desvio bloqueia a requisição e congela a cerca; a cerca nativa encerra o contexto.
- **Desfecho pelo driver.** `confirm`, `rejected` ou `uncertain` é decidido pelo driver, pela UI e pela releitura. `settle` informa se algo saiu (`sealed`) e se o fluxo terminou (`complete`).

`F3_MUTATION_FLOWS` tem hoje só o produtor 2 (`criar_organizacao`, com fonte no código). Os demais entram com seus drivers. Produtor sem fluxo falha em `arm` com `F3_FLOW_UNDEFINED`, e a mutação dele cai na allowlist de leitura, que a recusa.

### Decisões de causa raiz

- **Desfecho fora da cerca.** A cerca nativa não entrega o status nem o corpo da resposta à política. Inferir o desfecho ali seria uma segunda fonte de verdade. Por isso a cerca só decide o que sai, e o desfecho fica com o driver, registrado no livro.
- **Selo na primeira requisição, com ID do harness.** Selar só na RPC de negócio deixaria passos anteriores (por exemplo, o upload de documento) saírem sem registro. A chave gerada pela UI, quando existe, só é conhecida no envio, então o `requestId` do livro é o do harness, e a chave da UI é devolvida para a releitura.
- **Política de duplicidade.** `F3_DUPLICATE_POLICY` não foi preenchida para o SYS04 neste incremento. O `23505` vira "duplicado" em `src/lib/organizacao/criarOrganizacaoDados.ts:53`, mas só há unicidade se o corpo trouxer CNPJ. A política entra no 2b-2b, junto com o corpo do driver que define o CNPJ.

### Testes

- `integracao-v1-fase3.test.mjs` tem 44 testes, todos verdes. Oito são novos: M2, M3, isolamento, quatro da cerca e um dos fluxos com fonte conferida no arquivo.
- RED verificável: contra o executor da main (`e02d466`), a suíte nova falha (23 falhas e os testes da cerca não carregam).
- `eslint` e `prettier --check` estão limpos nos dois scripts.

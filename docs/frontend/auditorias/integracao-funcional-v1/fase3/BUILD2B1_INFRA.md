# Fase 3, BUILD-2b-1: infraestrutura offline do executor

O BUILD-2b foi dividido em duas PRs por decisão do titular, registrada na conversa de 13/11/2026, por volta das 23h (Bahia). Resposta literal: "2b-1 infra, 2b-2 drivers (Recomendado)". Esta PR, a #658, é a 2b-1.

O que esta PR **não** faz:
- não faz login;
- não abre navegador contra a HML;
- não cria dado.

Os drivers de UI dos produtores, a sessão do 2º usuário e a leitura das credenciais ficam para o BUILD-2b-2. Até lá, a execução HML grava um relatório `BLOCKED` e falha fechada com `F3_DRIVER_PENDING`. Nenhum REQUEST da Fase 3 pode ser criado antes disso.

**Arquivos alterados.** Todos estão na lista fechada da seção 7.6 do PLAN:
- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`;
- `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json`, que é novo, e este documento;
- `docs/frontend/planos/PLANO_ATIVO.json` e o prefixo do checkpoint.

**O que não muda:** o YAML, o auditor, o preparador, `src/**`, `types.ts`, as dependências, o backend e PROD.

## Causa raiz das quatro rodadas de revisão

As revisões 5900926490, 5901072418 e 5901160351 e o parecer R4 (5901220713) acharam sempre o mesmo tipo de defeito: uma regra contábil das intenções que faltava. Na primeira foi o cruzamento entre recibos, intenções e inventário, depois os casos entre execuções, por fim os envios por intenção e o "anterior" incoerente.

A causa era de projeto:
- o validador do relatório e o do ledger reimplementavam, regra por regra, o que o livro de intenções já fazia, e cada regra esquecida virava uma brecha;
- os testes eram exemplos escritos para o achado da vez, então fechavam aquele caminho e deixavam os vizinhos abertos.

A mesma análise revelou um defeito latente que nenhuma revisão tinha apontado. O livro exigia o ID da organização F3 logo na criação, mas é a própria execução que cria essa organização (SYS04, produtor 2). No BUILD-2b-2, o livro não conseguiria começar.

**Correção estrutural, aplicada uma vez:**
1. **Uma única máquina de estados.** A função `applyEvent` é a única definição das transições: selar, confirmar, rejeitar, incerto, readback encontrado, readback ausente e reenvio.
2. **O livro grava eventos.** Cada transição do livro vira um evento. O relatório (`intents.events`) e o ledger (`runs[].events`) carregam esses eventos.
3. **Os validadores reexecutam os eventos.** O relatório é reexecutado sobre o ledger anterior, e cada execução do ledger sobre as anteriores, na mesma máquina. Contadores, intenções, envios, pendentes, organização e inventário declarados precisam ser exatamente o resultado do replay. Nada é conferido regra por regra.
4. **O livro só nasce de um ledger validado.** Isso vale tanto para o livro quanto para o validador: `createF3IntentBook({ ledger })` e `validateF3Report(..., { ledger })` só aceitam o objeto devolvido por `validateF3Ledger`, que fica congelado. Não existe mais "anterior" informado por quem chama.
5. **Teste de propriedade.** Com semente fixa, sequências aleatórias de ações válidas, em até três execuções, sempre produzem ledger e relatório válidos. Uma adulteração isolada de cada cenário é sempre recusada. Resultado: 848 cenários e 848 adulterações recusadas.

## O que entra

| Peça | Função exportada | Código de falha |
|---|---|---|
| Recibo por caso (seção 16.2 do plano mestre mais os campos da F3) | `f3ReceiptBase`, `F3_RECEIPT_KEYS` | `F3_REPORT` |
| Status derivado das provas | `deriveF3Status`, `f3Summary` | `F3_REPORT` |
| Política de duplicidade por produtor, com fonte | `F3_DUPLICATE_POLICY`, `validateF3DuplicatePolicy` | `F3_DUPLICATE_POLICY` |
| Livro de intenções sobre o ledger validado | `createF3IntentBook` | `F3_SECOND_USER_MUTATION`, `F3_FOREIGN_ORG`, `F3_INTENT_REPLAY`, `F3_UNCERTAIN_RESEND`, `F3_BUDGET`, `F3_INTENT_PRODUCER`, `F3_INTENT_ID`, `F3_INTENT_DUPLICATE_OF`, `F3_INTENT_ENTITY`, `F3_INTENT_STATE`, `F3_INTENT_UNKNOWN`, `F3_INTENT_OPTIONS`, `F3_LEDGER_REQUIRED` |
| Relatório validado por replay e cruzado com os recibos | `validateF3Report` | `F3_REPORT`, `F3_ISOLATION`, `F3_NA_UNAPPROVED`, `F3_LEDGER_REQUIRED` |
| Gate quantitativo (seção 5 do PLAN) | `f3Gate` | devolve `PASS` ou `FAIL` |
| Relatório bloqueado e gravação com `SHA256SUMS` | `blockedF3Report`, `writeF3Artifacts`, `f3ProvenanceFromEnv` | `F3_REPORT`, `F3_CASES_HASH` |
| Ledger append-only com eventos por execução, só PASS (regra C) | `validateF3Ledger`, `validateF3LedgerExtension`, `emptyF3Ledger`, `f3LedgerState`, `preservedF3Cases`, `F3_HARNESS_EQUIVALENCES` | `F3_LEDGER`, `F3_LEDGER_HASH` |
| Perfil do 2º usuário e releitura do RBAC do `leitor` | `assertF3SecondUserProfile`, `assertF3LeitorRbac` | `F3_SECOND_USER_PROFILE`, `F3_RBAC_DRIFT` |
| Negação só por estado explícito | `classifyF3Access`, `F3_DENIAL_TOKENS`, `F3_PARTIAL_DENIALS` | `ERROR` na observação |
| Contrato do YAML (estrutura literal e SHA-256) | `assertF3WorkflowStructure`, `assertF3WorkflowContract` | `F3_WORKFLOW` |

## Regras que o código fixa

1. **Falso PASS no recibo.** O validador recalcula o status de cada recibo. `PASS` exige todas as condições abaixo:
   - positivo `PASS`;
   - os dois negativos de leitura `NEGADO`;
   - observado igual ao esperado (o `leitor` só nos 26 casos de ADM01);
   - nenhum `errorClass`;
   - `cleanupStatus` coerente com o produtor;
   - duplicidade igual à política do produtor.

   O status vira `FAIL` com qualquer `VAZAMENTO`, `ACCEPTED`, `CLEANUP_FAILED` ou divergência de acesso. Vira `BLOCKED` com prova ausente, `SEM_ENTIDADE`, observação `ERROR` ou produtor sem política. O resumo também é recalculado.
2. **Intenções e inventário por replay.**
   - O relatório traz os eventos desta execução e o resumo derivado deles: todas as intenções conhecidas, inclusive as anteriores, com desfecho, entidade e `sends` (envios nesta execução).
   - O validador reexecuta os eventos sobre o ledger informado e compara tudo por igualdade exata. Um pendente anterior não reconciliado continua no resumo como pendente e faz o gate falhar.
   - O inventário (`isolation.created` e `organizationF3`) também é o do replay. As entidades de execuções anteriores entram nele.
3. **Recibos cruzados com o replay.**
   - Os casos de um mesmo produtor compartilham `requestId`, entidades e duplicidade, e o `requestId` é único entre produtores.
   - Uma entidade só aparece no recibo da intenção que a criou, e um caso só é `PASS` se essa intenção foi confirmada.
   - `REJECTED` exige uma tentativa de duplicidade rejeitada no livro. Uma tentativa confirmada exige `ACCEPTED`, que é `FAIL`.
   - Recibo sem intenção (`NOT_RUN`) não afirma nada sobre duplicidade.
4. **Política de duplicidade por produtor.**
   - `F3_DUPLICATE_POLICY` define, para cada um dos 20 produtores, o resultado esperado e a fonte no código (`src/…:início-fim`).
   - As ordens 1 e 3 não mutam e só aceitam `DUPLICATE_NOT_DEFINED`.
   - Nos 18 mutantes a política nasce `null`, então nenhum caso mutante fecha `PASS` até o BUILD-2b-2 preenchê-la, por PR revisada.
5. **N/A.** `N_A_JUSTIFICADO` só vale para caso `CONDICIONAL` listado em `F3_NA_AMENDMENTS`. A lista nasce vazia e só recebe casos por emenda aprovada pelo titular (PLAN, seção 4, item 5).
6. **Campo livre ou credencial.**
   - Todo objeto tem chaves exatas, sem getter, proxy ou `toJSON`.
   - Os arrays só têm índices de dados próprios, sem buraco nem chave extra.
   - Cada string tem formato fechado: UUID, SHA, `dpl_…`, ID numérico ou código.
   - O gate e o gravador validam o próprio objeto, e o gravador valida de novo a serialização que vai para o disco.
7. **Organização e isolamento.**
   - Antes de existir a organização F3, só a criação dela (produtor 2, com `organizationId` nulo) pode ser selada. Depois, toda intenção exige `organizationId` igual à organização F3.
   - A criação é única. Só uma tentativa rejeitada, que não criou nada, libera nova tentativa; uma pendente exige readback antes.
   - A organização nunca é a `e87f7e68`, e todo registro pertence à organização F3.
   - Uma duplicidade aceita da organização é outra organização. Ela fica no inventário como `organizacao_duplicada`, e os recibos do produtor 2 viram `FAIL`.
   - Os contadores da `e87f7e68` só aceitam as chaves próprias V101, V104, V112 e V121 (`F3_E87_COUNTER_SCREENS`), com valores iguais antes e depois. O BUILD-2b-2 confirma pela UI que essas telas mostram contador.
8. **Livro de intenções.**
   - Só o MASTER sela, só nos produtores mutantes (ordens 2 e 4 a 20).
   - Cada `requestId` é selado uma vez, inclusive entre execuções.
   - Intenção incerta só é reenviada depois de um readback que prove ausência, e uma vez só.
   - `duplicateOf` aponta para uma intenção confirmada do mesmo produtor, desta execução ou de uma anterior.
   - Cada envio conta no orçamento, inclusive a duplicidade rejeitada e o reenvio: 30 por execução e 60 no total, acumulados pelo replay do ledger.
   - Uma intenção selada que termina a execução sem desfecho vira incerta na seguinte.
9. **Ledger.**
   - O `F3_LEDGER.json` nasce com `runs` e `entries` vazios. O SHA-256 `1d402a1a…` fica fixado em `F3_LEDGER_SHA256`.
   - Cada execução registra `workflowRunId`, harness e eventos.
   - Uma extensão parte do ledger fixado e só acrescenta. Cada entrada `PASS` cita uma execução registrada, com o mesmo harness, `artifactId`, `sha256` e `reviewId`.
   - Um PASS só é preservado com o mesmo produto, backend, deployment e harness, ou com uma equivalência revisada em `F3_HARNESS_EQUIVALENCES`. Ancestralidade não basta.
   - Os controles globais nunca são herdados.
10. **Negação.**
    - `DENY` exige o estado explícito registrado para a tela e nenhum conteúdo.
    - Em V117, a negação parcial de revisão não conta.
    - Em V123, `DENY` exige a RPC `pode_consultar_auditoria_organizacao` com HTTP 200 e corpo `false`.
    - V111 e V120 entram por emenda no BUILD-2b-2.
11. **YAML.** O executor recusa rodar se o YAML não tiver o SHA aprovado (`8da83394…`) e a estrutura literal dos itens a–d. São 22 adulterações testadas: 21 pegas pela estrutura e 1 só pelo SHA.
12. **Resultado parcial.**
    - Qualquer falha depois da checagem de evento grava `F3_REPORT.json`, a cópia do catálogo e `SHA256SUMS`.
    - O relatório bloqueado carrega o estado do ledger, sem exceção.
    - Relatório inválido nunca é gravado.

## Provas R4, R12 e R14 com o pai F3

R12 e R14 recebem `parentSha` igual ao `approved_parent_sha` do REQUEST e exigem só que o `headSha` de cada prova seja ancestral dele. R4 exige ancestralidade em relação ao `HEAD`.

Conferi em 13/11/2026, às 23h30 (Bahia), com as funções do auditor, os metadados reais do GitHub Actions (somente leitura) e o git local:

| Prova | `headSha` | Pai | Resultado |
|---|---|---|---|
| R4 | `4c3a92b` | `HEAD` = main `d2a6557` | OK |
| R12 | `3d6bea3` | `d2a6557` | OK |
| R14 | `6a62d7d` | `d2a6557` | OK |

As execuções citadas continuam sem artefatos, como as provas exigem. A prova definitiva é a revalidação do REQUEST.

## Ajustes em testes do BUILD-1

**Teste "executor não importa preparador nem lê secrets".** Ele passou a proibir o que importa, e não mais o texto:
- os imports só podem vir de `node:*` e de `./authenticated-visual-audit.mjs`;
- são proibidos `require(`, `createRequire`, `import(` dinâmico, `eval` e `new Function`;
- o único acesso a `process.env` é o parâmetro padrão de `runCli`;
- um teste de comportamento prova que o `runCli` só lê as cinco chaves de proveniência e não grava valor de secret.

**`assertF3Budget`.** Passa a usar `priorSent`, porque toda tentativa enviada conta (PLAN 7.2).

## Revisões

| Revisão | HEAD | Resultado | Tratamento |
|---|---|---|---|
| 5900926490 | `363b451` | CHANGES_REQUESTED (B1, I1–I4, M1–M5) | R2 |
| 5901072418 | `41a4331` | CHANGES_REQUESTED (A–E, entre execuções) | R3 |
| 5901160351 | `fcb5224` | CHANGES_REQUESTED (I-A, M-1–M-3) | R4 |
| 5901220713 | `4f204c9` | Parecer APPROVE registrado como comentário (N-1–N-4) | Correção estrutural desta versão |

Os achados N-1 a N-4 do parecer R4 são sintomas da causa raiz acima e deixam de existir no modelo por replay:
- **N-1:** o gate valida o próprio objeto;
- **N-2:** não há "anterior" informado por quem chama;
- **N-3:** o relatório bloqueado carrega o estado do ledger;
- **N-4:** o ledger é reexecutado, o que impede organização duplicada e envios incoerentes.

## Testes

- `integracao-v1-fase3.test.mjs` tem 33 testes verdes, entre eles o de propriedade (848 cenários, 848 adulterações recusadas).
- RED verificável: a suíte, rodada contra o executor do HEAD `4f204c9`, tem 16 falhas.
- Suíte do job `protocol`: 913 testes, 891 passam. As 2 falhas (281 e 378) são de ambiente local e falham igual na main `d2a6557`.
- `eslint` e `prettier --check` estão limpos.

## Próximo passo: BUILD-2b-2

- Drivers de UI dos 16 produtores de negócio e do vínculo ADM01, sobre o livro desta PR.
- `F3_DUPLICATE_POLICY` preenchida com a fonte no código de cada produtor.
- Login, seleção da organização e logout do MASTER e do 2º usuário. As credenciais só são lidas no passo do executor, e o executor falha fechado se faltarem `CONTAOS_HML_SYNTHETIC_2_*`.
- Releitura do RBAC do `leitor` e conferência do perfil.
- Confirmação pela UI dos estados de negação de V111 e V120 e dos contadores de `F3_E87_COUNTER_SCREENS`.
- Registro da execução no ledger (eventos do livro) e inventário de isolamento.
- Tipar os pré-requisitos finos e limitá-los a 5 (tabela 7.2 do PLAN), para distinguir pré-requisito de uma segunda criação do produtor.

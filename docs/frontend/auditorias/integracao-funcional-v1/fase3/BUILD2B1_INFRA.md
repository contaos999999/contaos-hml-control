# Fase 3, BUILD-2b-1: infraestrutura offline do executor

O BUILD-2b foi dividido em duas PRs por decisão do titular, na conversa de 13/11/2026, por volta das 23h (Bahia). A resposta literal foi "2b-1 infra, 2b-2 drivers (Recomendado)". Esta PR, a #658, é a 2b-1. Ela não faz login, não abre navegador contra a HML e não cria dado. Os drivers de UI, a sessão do 2º usuário e a leitura das credenciais ficam no BUILD-2b-2. Até lá, a execução HML grava um relatório `BLOCKED` e falha fechada com `F3_DRIVER_PENDING`. Nenhum REQUEST da Fase 3 deve ser criado antes disso.

Todos os arquivos alterados estão na lista fechada da seção 7.6 do PLAN:
- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`;
- `fase3/F3_LEDGER.json`, que é novo, e este documento;
- `PLANO_ATIVO.json` e o prefixo do checkpoint.

Não mudam: o YAML, o auditor, o preparador, `src/**`, `types.ts`, as dependências, o backend e PROD.

## Causa raiz das rodadas de revisão

As seis rodadas acharam defeitos de três causas de projeto. A regra canônica do titular, de 14/11/2026, manda corrigir pela causa e verificar que a correção não abre falha nova. Por isso as duas causas foram tratadas como classe, não caso a caso.

1. **Regras reimplementadas.** Rodadas 5900926490, 5901072418, 5901160351 e o parecer 5901220713. O validador do relatório e o do ledger reimplementavam, regra por regra, o que o livro de intenções fazia; cada regra esquecida virava uma brecha. A mesma análise revelou um defeito latente: o livro exigia o ID da organização F3 antes de a execução criá-la.
2. **Referências escolhidas por quem chama.** Rodada 5903041644. O gate e o gravador decidiam sobre um catálogo, um ledger e uma política passados como parâmetro, e comparavam por JSON folhas que podiam ser objetos com `toJSON`. Na correção da primeira causa apareceram mais duas falhas da mesma família, pegas pelo teste de propriedade antes de qualquer revisão:
   - o log aceitava eventos sem efeito;
   - o resumo misturava estados intermediários.
3. **Fato observado tratado como erro.** Rodada 5903136160.
   - O livro lançava exceção quando o produto devolvia algo inesperado, por exemplo uma entidade fora da F3, na `e87f7e68` ou repetida, em vez de registrar o fato.
   - As transições não eram atômicas: uma recusa marcava `rechecked` sem gravar o evento.
   - O relatório parcial não carregava o livro, então uma execução que falhasse depois de mutar perdia os envios e o inventário.

**Correção estrutural:**
- **Máquina de estados única.** `applyEvent` define todas as transições. O livro grava cada uma como evento, e o relatório e o ledger carregam esses eventos.
- **Replay em vez de regra por regra.** Os validadores reexecutam os eventos na mesma máquina e exigem igualdade exata com o que foi declarado.
- **Log canônico.** Todo evento muda o estado, e o resumo expõe o estado exato de cada intenção. Remover, trocar ou alterar qualquer evento muda o resumo ou quebra o replay.
- **Âncoras do próprio módulo.**
  - O catálogo só vale se foi gerado por `buildF3Cases`, e fica congelado e registrado.
  - O ledger só vale se foi validado por `validateF3Ledger`, que o congela e guarda o SHA-256 do bruto. O relatório declara `ledgerSha256`.
  - O gate usa sempre a política de produção e exige o ledger fixado em `F3_LEDGER_SHA256`. Quem chama não escolhe nada disso.
- **Árvore JSON pura.** Toda entrada (relatório, catálogo, ledger e proveniência) só tem objetos simples, arrays densos e folhas string, número finito, booleano ou nulo.
- **Fato observado sempre registrado.**
  - Toda entidade devolvida pelo produto entra no inventário com seu tipo (`F3_ENTITY_KINDS`): `organizacao`, `registro`, `organizacao_duplicada`, `fora_da_f3` ou `entidade_repetida`.
  - Só `organizacao` e `registro` estão isoladas na F3. Os demais tipos reprovam o critério `ISOLATION`, não fecham recibo PASS e não entram no ledger.
  - Só a violação de protocolo do driver é recusada.
- **Transação.** O livro aplica cada evento numa cópia e só troca o estado se tudo der certo. Uma recusa nunca deixa efeito colateral.
- **Relatório parcial com o livro.** `blockedF3Report({ book })` carrega os eventos, os envios e o inventário da execução, e o ledger montado a partir dele conta os envios reais.
- **Teto de eventos provado.** São no máximo 8 eventos por intenção e 60 intenções, ou seja, `F3_MAX_EVENTS_PER_RUN` = 480, aplicado dentro da própria máquina de estados.
- **Teste de propriedade com semente fixa.**
  - São 936 cenários de até três execuções. As ações sorteadas incluem fatos observados (entidade fora da F3, na `e87f7e68` ou repetida) e violações de protocolo.
  - Os relatórios parciais montados com o livro e os ledgers gerados sempre validam.
  - As 860 adulterações sorteadas foram todas recusadas: contadores, envios, estados, eventos removidos do meio, entidades trocadas e inventário.
  - Em 3.130 ações recusadas, de qualquer código, o estado continuou intacto.

## O que entra

| Peça | Função exportada | Códigos de falha |
|---|---|---|
| Recibo por caso, com `preservedFrom` (regra C) | `f3ReceiptBase`, `F3_RECEIPT_KEYS` | `F3_REPORT` |
| Status derivado das provas | `deriveF3Status`, `f3Summary` | `F3_REPORT` |
| Política de duplicidade por produtor, com fonte | `F3_DUPLICATE_POLICY`, `validateF3DuplicatePolicy` | `F3_DUPLICATE_POLICY` |
| Livro de intenções sobre ledger validado | `createF3IntentBook`, `F3_INTENT_KINDS`, `F3_ENTITY_KINDS`, `F3_MAX_PREREQUISITES`, `F3_MAX_EVENTS_PER_RUN` | `F3_INTENT_EVENT`, `F3_INTENT_EVENTS`, `F3_SECOND_USER_MUTATION`, `F3_FOREIGN_ORG`, `F3_INTENT_REPLAY`, `F3_UNCERTAIN_RESEND`, `F3_BUDGET`, `F3_INTENT_PRODUCER`, `F3_INTENT_PREREQUISITES`, `F3_INTENT_KIND`, `F3_INTENT_ID`, `F3_INTENT_DUPLICATE_OF`, `F3_INTENT_ENTITY`, `F3_INTENT_STATE`, `F3_INTENT_UNKNOWN`, `F3_INTENT_OPTIONS`, `F3_LEDGER_REQUIRED` |
| Relatório validado por replay, cruzado com os recibos | `validateF3Report`, `assertJsonTree` | `F3_REPORT`, `F3_ISOLATION`, `F3_NA_UNAPPROVED`, `F3_LEDGER_REQUIRED` |
| Critérios da seção 5 do PLAN e gate | `f3GateCriteria` (diagnóstico, nunca PASS), `f3Gate` | `PASS` ou `FAIL` |
| Relatório bloqueado e gravação com `SHA256SUMS` | `blockedF3Report`, `writeF3Artifacts`, `f3ProvenanceFromEnv` | `F3_REPORT`, `F3_CASES_HASH` |
| Ledger append-only com eventos e PASS ligados ao replay | `validateF3Ledger`, `validateF3LedgerExtension`, `emptyF3Ledger`, `f3LedgerState`, `preservedF3Cases`, `F3_HARNESS_EQUIVALENCES` | `F3_LEDGER`, `F3_LEDGER_HASH` |
| Perfil do 2º usuário e RBAC do `leitor` | `assertF3SecondUserProfile`, `assertF3LeitorRbac` | `F3_SECOND_USER_PROFILE`, `F3_RBAC_DRIFT` |
| Negação só por estado explícito | `classifyF3Access`, `F3_DENIAL_TOKENS`, `F3_PARTIAL_DENIALS` | `ERROR` na observação |
| Contrato do YAML | `assertF3WorkflowStructure`, `assertF3WorkflowContract` | `F3_WORKFLOW` |

## Regras que o código fixa

1. **Status do recibo.** Para dar `PASS`, todas estas condições precisam valer:
   - positivo `PASS`;
   - os dois negativos de leitura `NEGADO`;
   - observado igual ao esperado (o `leitor` só nos 26 casos de ADM01);
   - nenhum `errorClass`;
   - `cleanupStatus` coerente com o produtor;
   - duplicidade igual à política do produtor.

   O caso vira `FAIL` com `VAZAMENTO`, `ACCEPTED`, `CLEANUP_FAILED` ou divergência de acesso. Vira `BLOCKED` com prova ausente, `SEM_ENTIDADE`, observação `ERROR` ou produtor sem política.
2. **Intenções e inventário por replay.**
   - O relatório traz os eventos desta execução e o resumo derivado deles.
   - O resumo lista todas as intenções conhecidas, inclusive as anteriores, com tipo, estado exato, entidade, `sends` (envios nesta execução) e `rechecked` (relida nesta execução).
   - O inventário (`isolation.created` e `organizationF3`) também vem do replay.
3. **Tipos de intenção.**
   - `principal` é a criação do produtor. Só pode haver uma aberta por produtor; uma rejeitada ou abandonada libera nova tentativa.
   - `prerequisito`: no máximo 5 na fase (tabela 7.2 do PLAN).
   - `duplicidade`: no máximo uma por principal confirmada do mesmo produtor (PLAN 4.3).
   - Os recibos só apontam para a principal do próprio produtor.
4. **Recibos cruzados com o replay.**
   - Os casos de um mesmo produtor compartilham `requestId`, entidades e duplicidade.
   - O `requestId` é único entre produtores.
   - A entidade do recibo é a criada pela principal.
   - O resultado `PASS` exige a principal confirmada.
   - `REJECTED` exige a tentativa de duplicidade rejeitada; uma tentativa confirmada exige `ACCEPTED`.
5. **Política de duplicidade.**
   - Os 20 produtores têm resultado e fonte (`src/…:início-fim`).
   - As ordens 1 e 3 não mutam.
   - Nos 18 mutantes a política nasce `null`, então nenhum caso mutante fecha `PASS` até o BUILD-2b-2 preenchê-la, por PR revisada.
6. **N/A.** Só vale para caso `CONDICIONAL` listado em `F3_NA_AMENDMENTS`, que nasce vazio e só aceita emenda aprovada pelo titular (PLAN 4.5).
7. **Campo livre ou credencial.**
   - Só existe árvore JSON pura, com chaves exatas e formatos fechados (UUID, SHA, `dpl_…`, ID numérico e código).
   - O gate e o gravador validam o próprio objeto.
   - O gravador valida de novo a serialização que vai para o disco e exige que `casesRaw` seja o catálogo publicado e o mesmo emitido por `buildF3Cases`.
8. **Organização e isolamento.**
   - Antes de a organização F3 existir, só a sua criação pode ser selada, com `organizationId` nulo. Depois, toda intenção exige a organização F3.
   - A organização nunca é a `e87f7e68`, e todo registro pertence à F3.
   - Qualquer outra organização, seja por duplicidade aceita ou por materialização tardia de tentativa abandonada, entra no inventário como `organizacao_duplicada` e reprova o critério `ISOLATION`.
   - Uma entidade devolvida fora da F3 ou na `e87f7e68` entra como `fora_da_f3`, e uma já inventariada entra como `entidade_repetida`. As duas também reprovam o critério `ISOLATION`.
   - Os contadores da `e87f7e68` aceitam só as chaves próprias V101, V104, V112 e V121, e precisam ser iguais antes e depois.
9. **Livro de intenções.**
   - Só o MASTER sela, e cada `requestId` é selado uma vez, inclusive entre execuções.
   - Intenção incerta só é reenviada depois de readback que prove ausência, e uma vez só.
   - Intenção ausente pode ser abandonada (`abandon`). Abandonada não conta como pendente, mas precisa ser relida na execução que fecha a matriz (critério `ABANDONED_RECHECKED`). Se ela aparecer, é registrada como materialização tardia.
   - Duas principais confirmadas no mesmo produtor reprovam o critério `PRINCIPALS`.
   - Orçamento: 30 envios por execução e 60 no total, acumulados pelo replay. Duplicidade rejeitada e reenvio contam como envio.
10. **Ledger.**
    - O `F3_LEDGER.json` nasce vazio; o SHA-256 `1d402a1a…` fica fixado em `F3_LEDGER_SHA256`.
    - Cada execução registra `workflowRunId`, `frontendSha`, harness, `deploymentId` e eventos.
    - Cada entrada `PASS` (regra C) cita uma execução registrada, com a mesma proveniência, e traz o `requestId` e as entidades da principal. A principal precisa estar confirmada e isolada no estado ao fim da execução citada, não no estado final. Para produtor sem mutação, os dois ficam vazios.
    - Uma extensão parte sempre do ledger fixado e só acrescenta.
11. **Regra C no relatório.**
    - Um recibo pode vir preservado (`preservedFrom` igual ao `workflowRunId` da entrada) se tiver a proveniência e a intenção da entrada.
    - Só é aceito com o mesmo produto, backend, deployment e harness da execução atual, ou com equivalência revisada em `F3_HARNESS_EQUIVALENCES`.
    - Os controles globais nunca são herdados.
12. **Negação.**
    - `DENY` exige o estado explícito registrado para a tela e nenhum conteúdo.
    - V117 ignora a negação parcial de revisão.
    - V123 exige a RPC `pode_consultar_auditoria_organizacao` com HTTP 200 e corpo `false`.
    - V111 e V120 entram por emenda no BUILD-2b-2.
13. **YAML.** O executor recusa rodar se o YAML não tiver o SHA aprovado (`8da83394…`) ou a estrutura literal dos itens a–d. Há 22 adulterações testadas: 21 pegas pela estrutura e 1 só pelo SHA.
14. **Resultado parcial.**
    - Qualquer falha depois da checagem de evento grava `F3_REPORT.json`, o catálogo e `SHA256SUMS`.
    - Com o livro, o relatório parcial carrega a execução inteira. Sem livro, mas com o ledger lido, carrega o estado do ledger.
    - Antes de ler o ledger, `ledgerSha256` vale `null` e não há estado. Isso só é aceito como `BLOCKED`.
    - Relatório inválido nunca é gravado. O gravador aceita só `{ ledger }` e valida com a política de produção, como o gate.

## Provas R4, R12 e R14 com o pai F3

R12 e R14 recebem `parentSha` igual ao `approved_parent_sha` do REQUEST e exigem só ancestralidade dos `headSha`. R4 exige ancestralidade em relação ao `HEAD`. A conferência foi feita em 13/11/2026, às 23h30 (Bahia), com as funções do auditor, os metadados reais do GitHub Actions (somente leitura) e o git local:

| Prova | `headSha` | Pai | Resultado |
|---|---|---|---|
| R4 | `4c3a92b` | `HEAD` = main `d2a6557` | OK |
| R12 | `3d6bea3` | `d2a6557` | OK |
| R14 | `6a62d7d` | `d2a6557` | OK |

A prova definitiva é a revalidação do REQUEST.

## Ajustes em testes do BUILD-1

- O teste "executor não importa preparador nem lê secrets" deixou de procurar texto e passou a proibir o que importa:
  - imports só de `node:*` e de `./authenticated-visual-audit.mjs`;
  - nenhum `require(`, `createRequire`, `import(` dinâmico, `eval` ou `new Function`;
  - um único acesso a `process.env`, no parâmetro padrão de `runCli`;
  - um teste de comportamento prova que o `runCli` só lê as cinco chaves de proveniência e não grava valor de secret.
- `assertF3Budget` passa a usar `priorSent`, porque toda tentativa enviada conta (PLAN 7.2).
- `buildF3Cases` passa a congelar e registrar o catálogo, e `validateF3Cases` exige árvore JSON pura.

## Revisões

| Revisão | HEAD | Resultado | Tratamento |
|---|---|---|---|
| 5900926490 | `363b451` | CHANGES_REQUESTED (B1, I1–I4, M1–M5) | R2 |
| 5901072418 | `41a4331` | CHANGES_REQUESTED (A–E, entre execuções) | R3 |
| 5901160351 | `fcb5224` | CHANGES_REQUESTED (I-A, M-1–M-3) | R4 |
| 5901220713 | `4f204c9` | Parecer APPROVE, registrado como comentário (N-1–N-4) | R5, causa raiz 1 |
| 5903041644 | `49fc13d` | CHANGES_REQUESTED (âncoras e folhas; M-A–M-D) | R6, causa raiz 2 |
| 5903136160 | `588532c` | CHANGES_REQUESTED (A: fato observado; B: política no gravador; C: entrada pela execução citada) | R7, causa raiz 3 |

Na R6, os quatro menores da revisão 5903041644 também foram resolvidos, porque afetavam o funcionamento do BUILD-2b-2:
- **M-A, regra C:** entradas ligadas ao replay e recibo preservado;
- **M-B, `absent` sem fim:** criada a transição `abandon`, com releitura obrigatória;
- **M-C, intenções sem tipo:** tipos `principal`, `prerequisito` e `duplicidade`, com seus limites;
- **M-D, documento:** reescrito para o modelo final.

## Testes

- `integracao-v1-fase3.test.mjs` tem 36 testes, todos verdes, entre eles o de propriedade (936 cenários, 860 adulterações recusadas e 3.130 ações recusadas sem efeito).
- RED verificável: esta suíte, rodada contra o executor do HEAD `588532c`, tem 11 falhas. Contra o `49fc13d`, a suíte anterior tinha 13.
- Suíte do job `protocol`: 916 testes, 894 passam, 2 falham e 20 são pulados. As falhas 281 e 378 são de ambiente local e ocorrem também na main.
- `eslint` e `prettier --check` estão limpos.

## Próximo passo: BUILD-2b-2

- Drivers de UI dos 16 produtores de negócio e do vínculo ADM01, sobre o livro desta PR, com os pré-requisitos como `prerequisito`.
- `F3_DUPLICATE_POLICY` preenchida com a fonte no código de cada produtor.
- Login, seleção da organização e logout do MASTER e do 2º usuário, com as credenciais lidas só no passo do executor e falha fechada se faltarem as variáveis `CONTAOS_HML_SYNTHETIC_2_*`.
- Releitura do RBAC do `leitor` e conferência do perfil.
- Confirmação pela UI dos estados de negação de V111 e V120 e dos contadores de `F3_E87_COUNTER_SCREENS`.
- Registro da execução no ledger, com a proveniência completa, e inventário de isolamento.
- Em qualquer falha depois de criar o livro, o `runCli` passa o livro a `blockedF3Report`, para o resultado parcial carregar a execução.

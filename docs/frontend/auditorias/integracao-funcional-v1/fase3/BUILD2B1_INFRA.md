# Fase 3, BUILD-2b-1: infraestrutura offline do executor

O BUILD-2b foi dividido em duas PRs por decisão do titular, tomada na conversa de 13/11/2026 por volta das 23h (Bahia). A resposta literal foi: "2b-1 infra, 2b-2 drivers (Recomendado)". Esta PR é a 2b-1.

Ela não faz login, não abre navegador contra a HML e não cria dado. Os drivers de UI dos produtores, a sessão do 2º usuário e a leitura das credenciais ficam no BUILD-2b-2. Até lá, a execução HML grava um relatório `BLOCKED` e falha fechada com `F3_DRIVER_PENDING`. Nenhum REQUEST da Fase 3 deve ser criado antes disso.

Arquivos alterados, todos dentro da lista fechada da seção 7.6 do PLAN:
- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`;
- `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json` (novo) e este documento;
- `docs/frontend/planos/PLANO_ATIVO.json` e o prefixo do checkpoint.

Não mudam: o YAML, o auditor, o preparador, `src/**`, `types.ts`, as dependências, o backend e PROD.

## O que entra

| Peça | Função exportada | Código de falha |
|---|---|---|
| Recibo por caso (campos da seção 16.2 do plano mestre mais os da F3) | `f3ReceiptBase`, `F3_RECEIPT_KEYS` | `F3_REPORT` |
| Status derivado das provas, nunca declarado | `deriveF3Status`, `f3Summary` | `F3_REPORT` |
| Política de duplicidade por produtor, com fonte | `F3_DUPLICATE_POLICY`, `validateF3DuplicatePolicy` | `F3_DUPLICATE_POLICY` |
| Relatório só com IDs, enums, contadores e booleanos, com recibos, intenções e inventário cruzados | `validateF3Report` | `F3_REPORT`, `F3_ISOLATION`, `F3_NA_UNAPPROVED` |
| Gate quantitativo da seção 5 do PLAN | `f3Gate` | devolve `PASS` ou `FAIL` |
| Relatório bloqueado e gravação com `SHA256SUMS` | `blockedF3Report`, `writeF3Artifacts`, `f3ProvenanceFromEnv` | `F3_REPORT`, `F3_CASES_HASH` |
| Livro de intenções idempotente, também entre execuções | `createF3IntentBook`, `f3PriorFromLedger` | `F3_SECOND_USER_MUTATION`, `F3_FOREIGN_ORG`, `F3_INTENT_REPLAY`, `F3_UNCERTAIN_RESEND`, `F3_BUDGET`, `F3_INTENT_PRODUCER`, `F3_INTENT_ID`, `F3_INTENT_DUPLICATE_OF`, `F3_INTENT_ENTITY`, `F3_INTENT_OPTIONS` |
| Perfil do 2º usuário | `assertF3SecondUserProfile` | `F3_SECOND_USER_PROFILE` |
| Releitura do RBAC do `leitor` contra a fotografia v6 | `assertF3LeitorRbac` | `F3_RBAC_DRIFT` |
| Negação só por estado explícito | `classifyF3Access`, `F3_DENIAL_TOKENS`, `F3_PARTIAL_DENIALS` | `ERROR` na observação |
| Ledger append-only, só PASS (regra C), com execuções e intenções | `validateF3Ledger`, `validateF3LedgerExtension`, `preservedF3Cases`, `F3_HARNESS_EQUIVALENCES` | `F3_LEDGER`, `F3_LEDGER_HASH` |
| Contrato do YAML (estrutura literal e SHA-256) | `assertF3WorkflowStructure`, `assertF3WorkflowContract` | `F3_WORKFLOW` |

## Regras que o código fixa

1. **Falso PASS no recibo.** O validador recalcula o status de cada recibo. Para dar `PASS`, todas estas condições precisam valer:
   - positivo `PASS`;
   - os dois negativos de leitura `NEGADO`;
   - observado igual ao esperado (o `leitor` só nos 26 casos de ADM01);
   - nenhum `errorClass`;
   - `cleanupStatus` coerente com o produtor;
   - duplicidade igual à política do produtor.

   Viram `FAIL`: qualquer `VAZAMENTO`, `ACCEPTED` ou `CLEANUP_FAILED`, e qualquer divergência entre observado e esperado. Viram `BLOCKED`: prova ausente, `SEM_ENTIDADE`, observação `ERROR` e produtor ainda sem política. O resumo também é recalculado.
2. **Cruzamento de recibos, intenções e inventário** (revisão 5900926490, B1).
   - O relatório traz a lista de intenções, com `requestId`, produtor, `duplicateOf`, desfecho e `prior`. Os contadores precisam bater com essa lista.
   - Cada intenção nova é enviada uma vez e pode ser reenviada só uma vez.
   - Toda intenção confirmada criou exatamente uma entidade no inventário, e toda entidade aponta para a intenção que a criou.
   - Os casos de um mesmo produtor compartilham `requestId`, entidades e duplicidade.
   - `requestId` é único entre produtores. Uma entidade só pode aparecer no recibo do próprio produtor.
   - Um caso só é `PASS` se a intenção dele foi confirmada.
   - Intenção pendente faz o gate falhar. No livro, intenção selada sem desfecho conta como pendente.
3. **Duplicidade por produtor** (revisão, I2).
   - `F3_DUPLICATE_POLICY` fecha, para os 20 produtores, o resultado esperado e a fonte no código (`src/…:início-fim`). Os produtores sem mutação (ordens 1 e 3) só aceitam `DUPLICATE_NOT_DEFINED`.
   - Nos 18 mutantes a política nasce `null`. Por isso nenhum caso mutante fecha `PASS` até o BUILD-2b-2 preencher a política com a fonte, por PR revisada.
   - `REJECTED` exige uma tentativa de duplicidade rejeitada no livro, com `duplicateOf` apontando para a intenção confirmada do mesmo produtor. Uma tentativa confirmada exige `ACCEPTED`, que é `FAIL`.
4. **N/A.** `N_A_JUSTIFICADO` só vale para caso `CONDICIONAL` listado em `F3_NA_AMENDMENTS`, que começa vazio. Entrar nessa lista exige a emenda aprovada pelo titular prevista na seção 4, item 5, do PLAN.
5. **Campo livre ou credencial.** Todo objeto do relatório tem chaves exatas, sem getter nem proxy. Cada string tem formato fechado: UUID, SHA de 40 ou 64, `dpl_…`, ID numérico ou código em maiúsculas. E-mail, JWT, HTML ou texto livre falham.
6. **Isolamento** (revisão, I1 e M1).
   - A organização F3 não pode ser a `e87f7e68`, e todo registro criado pertence à organização F3.
   - O inventário tem exatamente uma entrada `organizacao`: a da intenção de criação da organização, com o próprio ID da F3.
   - Os contadores da `e87f7e68` só aceitam chaves próprias de `F3_E87_COUNTER_SCREENS` (V101, V104, V112 e V121). Qualquer chave da cadeia de protótipo, como `toString` ou `__proto__`, falha.
   - O gate exige esse conjunto exato, com valores iguais antes e depois. O BUILD-2b-2 confirma pela UI que cada uma dessas telas expõe contador e, se preciso, emenda o conjunto.
   - As consultas por tela usam `Object.hasOwn`.
7. **Livro de intenções** (revisão, B1, I4 e M2).
   - Só o MASTER sela intenção, só nos produtores mutantes (ordens 2 e 4 a 20) e só na organização F3. Opções desconhecidas, como o antigo `priorConfirmed`, falham.
   - Cada `requestId` é selado uma vez, inclusive entre execuções: `f3PriorFromLedger` passa ao livro os `requestId` anteriores.
   - A intenção incerta, desta execução ou de uma anterior, só é reenviada depois de um readback que prove ausência, e uma vez só.
   - Um readback que acha a entidade em outra organização falha com `F3_FOREIGN_ORG`.
   - `duplicateOf` precisa apontar para uma intenção confirmada do mesmo produtor nesta execução. A confirmação de uma tentativa de duplicidade devolve `duplicateAccepted: true`.
   - Entidade repetida falha.
   - Cada envio conta no orçamento, inclusive a duplicidade rejeitada: 30 por execução e 60 no total. O total vem do ledger, não do chamador.
8. **Negação.**
   - `DENY` exige o estado explícito registrado para a tela e nenhum conteúdo. Tela vazia, genérica, com estado de outra tela ou com conteúdo junto da negação é `ERROR`.
   - Em V117, a negação parcial de revisão (`!pode_revisar`) não conta como negação da tela.
   - Em V123, `DENY` exige a RPC `pode_consultar_auditoria_organizacao` com HTTP 200 e corpo `false`. Assim, o `catch(() => false)` da tela não transforma erro em negação.
   - Os tokens de V111 e V120 entram por emenda no BUILD-2b-2, depois de confirmados pela UI. Até lá, qualquer negação nessas telas é `ERROR`.
9. **Ledger** (revisão, I3 e I4).
   - `F3_LEDGER.json` nasce com `runs` e `entries` vazios. O SHA-256 `1d402a1a…` fica fixado em `F3_LEDGER_SHA256`.
   - Cada execução registra `workflowRunId`, harness, intenções enviadas e desfechos. Isso permite derivar o orçamento acumulado e reconciliar um incerto de uma execução anterior.
   - Um `requestId` só reaparece em outra execução como reconciliação de um pendente.
   - Uma extensão parte do ledger fixado e só acrescenta: entradas `PASS` do catálogo, sem repetir caso, com proveniência completa, `artifactId`, `sha256`, `reviewId` e a execução registrada.
   - Um PASS só é preservado com o mesmo produto, o mesmo backend, o mesmo deployment e o mesmo harness, ou com uma equivalência revisada em `F3_HARNESS_EQUIVALENCES`, que começa vazia. A ancestralidade sozinha não basta, porque o plano mestre (16.3) exige equivalência revisada.
   - Os controles globais ficam no relatório e nunca são herdados.
10. **YAML** (revisão, M3). O executor recusa rodar se o YAML da checkout não tiver o SHA-256 aprovado (`8da83394…`). Recusa também se a estrutura não bater por texto literal nos pontos abaixo:
    - o bloco `on:`;
    - a permissão do topo e as dos jobs `request` e `private`;
    - o environment `hml` e o timeout do job `private`;
    - os passos de revalidação, Trilha A, executor F3, hashes e evidência;
    - a barreira nativa antes de todos eles.

    Toda expressão com `secrets` tem a forma `secrets.NOME`, com um dos quatro nomes aprovados. `toJSON`, índice `secrets[...]`, `vars.*`, `continue-on-error` e `|| ...` no token da revalidação são proibidos.

    O teste prova 22 adulterações recusadas. Só a última, a remoção do passo do bun, depende apenas do SHA; as outras 21 são pegas pela estrutura sozinha. A lista inclui as permissões do topo e do job `private`, gatilho `push` novo, `toJSON(secrets)` e um `|| echo scope=...` forjando o escopo.
11. **Resultado parcial.** Qualquer falha depois da checagem de evento grava `artifacts/integracao-v1-fase3/F3_REPORT.json`, a cópia do catálogo e `SHA256SUMS`. Sem catálogo válido, o relatório sai sem casos. Relatório inválido nunca é gravado.

## Provas R4, R12 e R14 com o pai F3

Na operação `fixtures`, `--request-preflight` e `--request-revalidate` exigem as provas `R4_ZERO_AUTH_PROOF`, `R12_ZERO_AUTH_PROOF` e `R14_ZERO_AUTH_PROOF`:
- R12 e R14 recebem `parentSha` igual ao `approved_parent_sha` do REQUEST e só exigem que o `headSha` de cada prova seja ancestral dele;
- R4 exige ancestralidade em relação ao `HEAD`;
- nenhuma delas compara o pai com um SHA fixo.

Conferi em 13/11/2026, às 23h30 (Bahia), usando as funções do próprio auditor, os metadados reais do GitHub Actions (somente leitura) e o histórico git local:

| Prova | `headSha` | Pai usado | Resultado |
|---|---|---|---|
| R4 | `4c3a92b` | `HEAD` = main `d2a6557` | OK |
| R12 | `3d6bea3` | `d2a6557` | OK |
| R14 | `6a62d7d` | `d2a6557` | OK |

Os três `headSha` são ancestrais da main, e as execuções citadas continuam sem artefatos, como as provas exigem. Como o merge do BUILD-2b-2 vai descender da main, a ancestralidade se mantém. A prova definitiva é a própria revalidação do REQUEST.

## Ajustes em testes do BUILD-1

**Teste "executor não importa preparador da Trilha A nem lê secrets fora do passo".** Ele procurava os textos `prepare-visual-fixtures` e `CONTAOS_HML_SYNTHETIC` em qualquer lugar do código, e o contrato do YAML precisa citar esses nomes. Agora a proteção é mais forte e não depende de texto (revisão, M4):
- os imports só podem vir de `node:*` e de `./authenticated-visual-audit.mjs`;
- `require(`, `createRequire`, `import(` dinâmico, `eval` e `new Function` são proibidos;
- o único acesso a `process.env` é o parâmetro padrão de `runCli`;
- um teste de comportamento roda `runCli` numa cópia isolada com um `env` instrumentado e prova duas coisas: só são lidas `GITHUB_EVENT_NAME`, `CONTAOS_FRONTEND_SHA`, `CONTAOS_HARNESS_SHA`, `CONTAOS_DEPLOYMENT_ID` e `GITHUB_RUN_ID`, e nenhum valor dos secrets aparece no relatório gravado.

**`assertF3Budget`.** O parâmetro passou de `priorConfirmed` para `priorSent`, porque a seção 7.2 do PLAN manda contar toda tentativa enviada, não só as confirmadas.

## Revisão 5900926490 (CHANGES_REQUESTED no HEAD `363b451`)

| Achado | Tratamento |
|---|---|
| B1: gate sem cruzar intenções, recibos e inventário | Regra 2. Testes "(B1)" e "(M1)" |
| I1: chaves por protótipo, contadores livres | Regra 6, `Object.hasOwn` e `F3_E87_COUNTER_SCREENS`. Teste "(I1)" |
| I2: duplicidade sem política por produtor | Regra 3. Teste "(I2)" |
| I3: preservação por ancestralidade | Regra 9, `F3_HARNESS_EQUIVALENCES`. Teste "(I3)" |
| I4: teto de 60 sem acumulado entre execuções | Regras 7 e 9, `runs` no ledger e `f3PriorFromLedger`. Teste "(I4)" |
| M1: inventário frouxo | Regras 2 e 6 |
| M2: `duplicateOf`, duplicidade aceita, entidade repetida | Regra 7. Teste "(M2)" |
| M3: estrutura do YAML com lacunas | Regra 10, 22 adulterações |
| M4: teste do BUILD-1 enfraquecido | Seção anterior. Testes "(M4)" |
| M5: "permissão `write`" ambígua | A permissão do topo e a do job `private` agora são testadas |

Também foram fechados três pontos que os próprios scripts de ataque do revisor mostravam: opções desconhecidas no livro, a extensão do ledger sem conferir o SHA fixado do anterior, e `vars.*` ou timeout alterados no YAML.

## Testes

- `integracao-v1-fase3.test.mjs` tem 33 testes, todos verdes. RED verificável: esta mesma suíte, rodada contra o executor do HEAD `363b451`, tem 17 falhas.
- Suíte do job `protocol` (auditor, preparador e F3): 913 testes, 891 passam. As 2 falhas, `GET publico nunca envia Authorization` e `R13 POSIX ignored-build template`, são de ambiente local e falham igual na main `d2a6557` (891 testes, 869 passam). A prova é o CI.
- `eslint` e `prettier --check` estão limpos nos arquivos alterados.

## Próximo passo: BUILD-2b-2

- Drivers de UI dos 16 produtores de negócio e do vínculo ADM01, sobre o livro de intenções desta PR.
- Preenchimento de `F3_DUPLICATE_POLICY` com a fonte no código de cada produtor.
- Login, seleção da organização e logout do MASTER e do 2º usuário. As credenciais são lidas só no passo do executor, e a execução falha fechada antes do login se faltarem `CONTAOS_HML_SYNTHETIC_2_*`.
- Releitura do RBAC do `leitor` com `assertF3LeitorRbac` e conferência do perfil com `assertF3SecondUserProfile`.
- Confirmação pela UI dos estados de negação de V111 e V120 e dos contadores de `F3_E87_COUNTER_SCREENS`, com emenda do catálogo se necessário.
- Registro da execução no ledger e inventário de isolamento.

# Fase 3, BUILD-2b-2: drivers de UI, em incrementos

O titular pediu, em 14/11/2026, a execução integral do BUILD-2b-2 ("Execute integralmente").

O levantamento mostrou que o BUILD-2b-2 tem o tamanho do preparador da Trilha A. Para cada um dos 16 produtores de negócio e para o ADM01, o executor precisa de:
- fluxo de mutação na cerca;
- leituras permitidas;
- driver de UI;
- teste offline com os componentes reais.

Por isso o BUILD-2b-2 sai em PRs incrementais. Cada uma tem revisão independente por causa raiz (P0-RCA-001) e fica dentro da lista fechada da seção 7.6 do PLAN. Nenhum REQUEST da Fase 3 é criado antes do último incremento. O motivo é que uma falha na HML exige novo PLAN, BUILD e REQUEST, com nonce novo (PLAN §9, passo 6, e §12.4).

| Incremento | PR | Conteúdo | Estado |
|---|---|---|---|
| 2b-2a | #679 | Fundação: M2, M3, M-A, `runF3Session`, isolamento que encerra, cerca de mutação ligada ao livro e o redesenho único da cerca pela emenda 1 do PLAN (§12) | em revisão |
| 2b-2b | a abrir | Sessões do MASTER e do `leitor`, SYS04, ADM01, releitura do RBAC e conferência posterior do 2º usuário | próximo |
| 2b-2c em diante | a abrir | Drivers dos produtores V102 a V122, em grupos, com política de duplicidade com fonte, esperas W1–W5 e teste offline | depois |

Cada incremento a partir do 2b-2b tem `P0_GOV_PLAN_<PR>.json` próprio, integrado na main antes do BUILD (PLAN §12.5 e `P0_GOV_PLAN_679.json`).

## 2b-2a: fundação

**Arquivos:**
- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`;
- este documento, `F3_FLUXOS_PRODUTORES.md` (revisão 3), `PLANO_ATIVO.json`, o prefixo do checkpoint e o ledger P0-NR-001 (NR-008).

**O que não muda:** YAML, auditor, preparador, `src/**`, `types.ts`, dependências, backend e PROD. `F3_LEDGER.json` continua vazio, com o mesmo SHA fixado (`1d402a1a…`).

### Obrigações do BUILD-2b-1 cumpridas

- **M2, proveniência amarrada à mutação.**
  - `createF3IntentBook({ ledger, provenance })` exige a proveniência completa.
  - `blockedF3Report({ book })` usa a proveniência do livro.
  - Um relatório com eventos exige proveniência completa.
- **M3, execução do ledger ligada ao artefato.** Os campos `artifactId`, `sha256` do ZIP e `reviewId` ficam na execução, e a entrada `PASS` os herda.
- **M-A, ramo e87 exercitado.** A propriedade exige entidades da `e87f7e68`. Hoje são 270.
- **Sessão.** `runF3Session` cria o livro, roda o driver com prazo de 40 minutos, congela no prazo ou no cancelamento, faz a conferência final de isolamento e devolve o parcial com o livro.
- **Isolamento.** `book.assertIsolation()` encerra com `F3_ISOLATION_BREACH` quando há entidade fora da F3 ou pré-requisito não isolado. Roda em todo `arm` e no fim da sessão.

### Cerca de mutação: redesenho único pela emenda 1 do PLAN (§12.5)

A causa comum das rodadas R1 e R2 desta PR, e da R1 da emenda (#678), foi desenhar a cerca antes de conhecer o fluxo de rede inteiro. O redesenho parte do levantamento campo a campo (`F3_FLUXOS_PRODUTORES.md`). Ele aplica uma única regra, executada pela máquina de estados do livro e reexecutada pelo replay do relatório e do ledger. A cerca não tem regra paralela à do validador, e é isso que fecha a causa da #658.

- **Fluxos declarados do levantamento** (`F3_MUTATION_FLOWS["ordem:ação"]`). São 30 ações, uma por linha da seção 3 do levantamento: 18 principais e variantes, mais os 11 pré-requisitos. Cada ação declara:
  - produtor, tipo e linha do levantamento;
  - os passos, com fonte no código;
  - os inícios permitidos de reenvio (`resend`, ou `null` para produtor sem chave);
  - os papéis criados (`creates`), ou a entidade do inventário que ela atualiza (`updates`).

  O upload simples (Edge, Storage e confirmação) é um bloco de três passos dentro da ação que consome o arquivo.
- **Origem tipada por posição.** A posição é o caminho no corpo: `a`, `a.b`, ou `a[]` para elementos de lista. A origem vem da lista fechada `F3_VALUE_ORIGINS`:
  - `gerado_ui` e `capturado` são sempre vaga `f3Slot`;
  - `inventario` precisa ser entidade isolada criada pela ação e pelo papel declarados;
  - `derivado` nunca é a e87 nem entidade não isolada;
  - `usuario_sintetico` é o usuário capturado no 1º vínculo do ADM01;
  - posição não declarada é literal, sem UUID inteiro nem embutido.
- **Vínculo de cada passo** (evento `bind`). Cada passo que sai registra no livro os UUIDs das posições declaradas e o SHA-256 do corpo canônico, na mesma transação do selo. A regra de cada origem é aplicada nesse vínculo:
  - **frescor:** `gerado_ui` e `capturado` não podem ser entidade, organização, e87 nem valor já usado;
  - **consistência:** a mesma vaga capturada em dois passos traz o mesmo valor;
  - **caminho do Storage:** só `<organização F3>/uploads/<uuid v4>/<nome>`.
- **Reenvio vinculado.** O reenvio só é permitido depois de readback, a partir de um início declarado (no upload, só o RPC consumidor). Cada vínculo do reenvio tem de ser idêntico ao do envio original no mesmo passo. Uma chave nova ou um corpo diferente congela a cerca. Produtor sem chave nunca é reenviado.
- **Confirmação.** Uma intenção só confirma com o fluxo inteiro vinculado no envio corrente. Rejeição e incerteza exigem ao menos o 1º passo vinculado. A ação que cria entidades confirma exatamente os papéis declarados. A que atualiza confirma a entidade do inventário declarada e não cria nada.
- **Âncoras da emenda:**
  - `F3_BUDGET`: 60 no total, 40 por execução, 39 previstas;
  - `F3_MAX_PREREQUISITES`: 11;
  - `F3_MAX_EVENTS_PER_RUN`: (8 + 2 × 4) × 60 = 960;
  - `F3_WAITS`: W1 a W5, com prazo e códigos;
  - envio resumível bloqueado com `F3_UPLOAD_RESUMABLE`, que vira o código da sessão.
- **Espera** (`awaitF3Condition`). Só por leitura, com prazo contado do disparo. O desfecho é `ok`, o código de prazo ou o código de falha, e nunca há reenvio. Na W3, uma execução concluída com `pode_revisar` falso é falha, não prazo (M2 da review 5906090998).
- **Mantidos da R2:**
  - classificação pelo significado (destino e método);
  - OPTIONS sem selo;
  - uma cerca por livro;
  - congelamento no livro;
  - RESPONSE com o mesmo ticket, URL, método e corpo;
  - invariante de carregamento, que agora vale para as RPCs de todos os 30 fluxos;
  - `f3ReadOnlyPolicy` do `leitor`.

**O que o replay prova.** O replay prova que a história é consistente com as regras. Ele não distingue a troca de um valor gerado ou derivado por outro valor novo e plausível. A autenticidade do artefato vem do SHA-256 do ZIP no ledger (M3).

### Defeito latente do BUILD-2b-1, corrigido nesta PR

**Fato.** Os produtores que atualizam uma entidade existente confirmavam um ID já inventariado. São eles: V103, V106, a publicação de V108, a aprovação e a aplicabilidade de V107 e a publicação de V109.

**Efeito.** O livro classificava a entidade como `entidade_repetida`, que reprova o isolamento. O cruzamento dos recibos e o ledger também exigiam uma entidade criada pela própria intenção. Numa execução real, esses casos nunca chegariam a PASS.

**Causa.** É a mesma classe da R7 da #658, um fato observado tratado como erro. O modelo só conhecia ações de criação.

**Correção.** A ação declara `updates`. A confirmação aponta a entidade do inventário, `crossCheck` e o ledger usam a entidade principal da intenção (`primaryOf`), e o recibo de referência fecha em PASS para os produtores 6, 8, 9 e 10.

### §12.6 do PLAN: onde cada teste RED está

| RED da §12.6 | Incremento | Teste |
|---|---|---|
| Espera vencida, sem reenvio | 2b-2a (primitiva); 2b-2c (driver) | "espera só por leitura, com prazo do disparo, falha própria e sem reenvio" |
| Arquivo recusado pelo verificador | 2b-2a (código); 2b-2c (driver) | mesmo teste (W2) |
| Edge pede TUS | 2b-2a | "upload dentro da ação, caminho só da organização F3, TUS bloqueado e reenvio só do RPC" |
| Upload dentro da ação; upload sem RPC não fecha | 2b-2a | mesmo teste |
| 41ª intenção e 12º pré-requisito | 2b-2a | "orçamento de 40 por execução…"; "tipos de intenção, uma principal por produtor, 11 pré-requisitos…" |
| Origem não declarada: e87, outro usuário, chave nova, caminho alheio | 2b-2a | os dois testes "R3 RED (A)", o teste "R3 RED (B)" e o teste de upload |
| Reenvio de produtor sem chave | 2b-2a | "R3 RED (B)" e "execuções anteriores…" |
| Fluxo sem linha ou linha sem fluxo (barreira do NR-008) | 2b-2a | "R3 RED (NR-008)" |

### Obrigações registradas para os incrementos seguintes

- **2b-2b:**
  - testar o `runCli` com um driver que gere eventos, sem driver escolhido por quem chama;
  - depois do vínculo do ADM01, reler `listar_usuarios_vinculos_adm` e conferir o par usuário e e-mail com o secret do 2º usuário, fora do relatório;
  - preencher `F3_DUPLICATE_POLICY` do SYS04 com fonte.
- **2b-2c em diante:**
  - usar `awaitF3Condition` em W1 a W5, com o disparo pelo selo da requisição;
  - na W3, mapear `pode_revisar` falso como falha (M2);
  - fazer os drivers de V110 e V111 independentes da contagem de documentos do contrato, porque o pré-requisito de V122 roda antes deles (M4);
  - aplicar a regra de nonce novo na recuperação (§12.4).

### Revisões

**R1 (HEAD `ec69e0e`): REQUEST_CHANGES.** Grupos A a E, todos corrigidos por classe na R2:
- A: classificação pelo significado e corpo canônico;
- B: `book.check` com a mesma `applyEvent`;
- C: só opções de produção;
- D: oráculo pelo produto e propriedade;
- E: isolamento em todo `arm`.

A correção revelou um vazamento de diretório temporário no teste M4 do 2b-1, também corrigido.

**R2 (HEAD `af50cff`): REQUEST_CHANGES.**
- **Corrigidos na própria R2:** C (uma cerca por livro e congelamento no livro), D (prazo da sessão), E (asserções isoladas) e G (catálogo antes do livro e invariante da allowlist).
- **Dependiam da emenda do PLAN, e foram fechados aqui pelo redesenho único:**
  - A, origem dos UUIDs sem tipo: origem por posição e vínculo no livro;
  - B, reenvio: reenvio vinculado e variante sem convite;
  - F, documento: este texto.

### Prova de mutação do redesenho

A lista e o resultado estão na seção "Prova de mutação R3", ao final deste documento.

### Testes

- `integracao-v1-fase3.test.mjs`: 58 testes, todos verdes, nenhum diretório temporário deixado no disco.
- `eslint` e `prettier --check` limpos nos dois scripts.
- **Suíte de protocolo** (auditor, preparador e F3): as 19 falhas locais são idênticas às da main no mesmo ambiente (clone raso; as provas R5, R8 e R13 leem histórico). Não há nenhuma falha nova.

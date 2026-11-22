# Integração funcional V1: Fase 3, cadastros e relacionamentos (PLAN/GATE)

> PLAN/GATE documental, anterior ao BUILD. Não é certificado de execução e, por si só, não cria workflow, fixture, usuário nem evidência. A fonte normativa é o plano mestre `docs/frontend/planos/PLANO_MESTRE_AUDITORIA_INTEGRACAO_FUNCIONAL_V1_7_FASES.md` (seções 13.5, 16 e 18), aceito integralmente pelo titular e integrado pelas PRs #653 (`fe94015`) e #654 (`58097ad`). Esta é a revisão R2, que atende C1, I1–I6 e M1–M5 da revisão independente do HEAD `1798673`.

## 1. Entrada e dependências

| Item | Valor |
|---|---|
| Fase 1 | CERTIFICADA (`fase1/CERTIFICADO.md`, 27 telas, 577 relações) |
| Fase 2 | CERTIFICADA (PR #652, `b2feca7`, ledger v5 com 52/52) |
| Plano mestre | v1.1, aceito na seção 18 |
| Matriz | `docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv`, blob `bb7ce43f9c334f2f03e9aafab405addadfe5e19a`, 138 linhas, coluna `caso_fase3` |
| Baseline `main` deste PLAN | `58097ad4a0d4126856072bba6dc6e8f5b2994552` |
| Produto HML certificado na F2 | `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97`, deployment `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz` |
| Supabase HML | `gklhhhyosgasnyoxlrui`. PROD proibido |

## 2. Decisões do titular e divergências aprovadas

O titular, Edivan Santos Celestino, respondeu a perguntas de múltipla escolha na conversa de execução de 13/11/2026, depois das 20h45 (horário da Bahia). Cada fala citada abaixo é o rótulo exato da opção que ele escolheu.

1. **Organização da Fase 3.** Pergunta: onde ficam os dados criados pela Fase 3. Resposta literal: "Nova organização sintética (Recomendado)". A opção dizia que o MASTER cria, pela SYS04, uma organização exclusiva da Fase 3, que nada se mistura com a `e87f7e68` e que o isolamento faz o papel de limpeza.
2. **Segundo usuário.** Resposta literal: "Autorizo 2º usuário sintético (Recomendado)". O usuário é sintético, existe só na HML, nasce sem perfil e tem credenciais guardadas apenas em secrets do GitHub.
3. **Sessão do segundo usuário.** Resposta literal: "Autorizo login, perfil leitor (Recomendado)". O usuário é vinculado com o perfil `leitor`, restrito à organização da Fase 3. Ele entra só para ler e não faz nenhuma mutação. O logout precisa ser comprovado. A senha chega somente ao passo do executor, depois da barreira nativa.

**Divergência aprovada em relação à seção 16.2 do plano mestre** (que prevê cleanup por "Remoção/reversão testada"). Pela decisão 1, a Fase 3 não exclui nem reverte dados. A base é a decisão do titular. Além disso, o produto não oferece exclusão para várias entidades; as versões de documento, por exemplo, são aditivas. O BUILD registra a fonte no código para cada produtor.

Valores possíveis de `cleanupStatus`:
- `ISOLATED_NO_DELETE`: o dado foi criado e ficou confinado à organização da Fase 3.
- `NO_MUTATION`: o caso não criou dados.
- `CLEANUP_FAILED`: o confinamento não foi comprovado, e o caso fica `FAIL`.

A prova de "zero mutação fora da organização da F3" tem duas partes. A primeira é o inventário final de IDs criados, cada um com sua organização. A segunda são leituras de conferência feitas pelo MASTER na própria UI: os IDs aparecem na organização da Fase 3, e os contadores das telas de lista da `e87f7e68` são iguais antes e depois da execução.

## 3. Escopo dos casos

São 138 posições `IFV1-F3-Cxxxx`, uma por linha da matriz:
- 120 OBRIGATORIA `dados_esperados`, duas delas com destino V123 (C0034 e C0068);
- 18 CONDICIONAL `auditoria_esperada`, todas com destino V123.

Essas conexões saem de 20 produtores. Cada produtor é exercido o mínimo necessário, nesta ordem de dependência:

| Ordem | Origem | Produtor | Conexões |
|---:|---|---|---:|
| 1 | SYS01 | `listar_organizacoes_disponiveis` (login) | 2 |
| 2 | SYS04 | `criar_organizacao` | 1 |
| 3 | SYS04 | `preferencia_de_organizacao_selecionada` | 25 |
| 4 | ADM01 | `salvar_vinculo_usuario_adm` (2º usuário, perfil `leitor`) | 26 |
| 5 | V102 | `contratantes` | 4 |
| 6 | V103 | `atualizar_contratante` | 5 |
| 7 | V105 | `contratos` | 4 |
| 8 | V106 | `atualizar_contrato_v1` | 11 |
| 9 | V108 | `publicar_versao_proposta_v108` | 4 |
| 10 | V107 | `definir_aplicabilidade_fonte_v107` | 7 |
| 11 | V109 | `executar_comando_lista_v1` | 6 |
| 12 | V110 | `criar_documento_contrato_completo` | 3 |
| 13 | V111 | `adicionar_versao_documento_contrato` | 5 |
| 14 | V113 | `criar_competencia` | 9 |
| 15 | V115 | `criar_documento_competencia_v115` | 6 |
| 16 | V116 | `solicitar_analise_competencia` | 5 |
| 17 | V117 | `registrar_revisao_requisito_v117` | 5 |
| 18 | V118 | `aprovar_parecer_interno` | 3 |
| 19 | V119 | `registrar_apresentacao` | 3 |
| 20 | V122 | `registrar_relatorio_historico_hml` | 4 |

O BUILD confirma no código das telas a ordem 9→10 e os pré-requisitos finos, como uma solicitação de parecer antes de `aprovar_parecer_interno`. Qualquer divergência vira emenda deste PLAN, nunca um atalho.

## 4. Semântica de cada caso

O recibo de cada `IFV1-F3-Cxxxx` registra os itens abaixo.

1. **Positivo.** O MASTER usa o produtor da origem, pela interface real, para criar ou associar a entidade sintética na organização da Fase 3. Em seguida, abre a tela de destino pelo menu ou pela rota direta, conforme a Fase 2. Por IDs e enums, confere que a entidade aparece ligada à organização, ao contratante, ao contrato e à competência corretos. A conferência se repete depois de recarregar a página.
2. **Negativos de leitura, obrigatórios em todo caso.**
   - *Referência inexistente:* a rota de destino com um UUID sintético inexistente deve mostrar estado vazio ou "não encontrado", nunca dados de outra entidade.
   - *Outra organização:* com a organização da Fase 3 selecionada, a rota de destino com o ID de uma entidade do mesmo tipo da `e87f7e68` deve ser negada ou vir vazia, sem vazamento.

   Se a `e87f7e68` não tiver uma entidade do tipo exigido pelo destino, o negativo fica `BLOCKED`, nunca `N_A`. Nesse caso, o caso não fecha como PASS.
3. **Duplicidade.** É exercida uma vez por produtor, quando o contrato do produtor define unicidade. A segunda tentativa deve ser rejeitada sem criar um segundo registro. O resultado vai para o recibo de cada caso daquele produtor, com o mesmo `requestId`. Se o produtor não define unicidade, o recibo registra `DUPLICATE_NOT_DEFINED`, com a fonte no código. Isso aplica literalmente a seção 13.5, porque a duplicidade é uma propriedade do produtor, não da tela de destino.
4. **ADM01 (26 casos).** O MASTER vincula o 2º usuário à organização da Fase 3 com o perfil `leitor`. O 2º usuário entra e confere, na própria sessão:
   - as organizações disponíveis (C0002);
   - o painel (C0005);
   - as permissões efetivas refletidas em cada tela de destino (C0007–C0032 e C0034);
   - o evento em V123 (C0033), nas condições do item 5.

   O resultado esperado em cada destino (permitido ou negado) vem da matriz RBAC do perfil `leitor`, tela por tela. Nenhum destino é presumido visível; V123 e as telas administrativas (C0033 e C0034) seguem essa matriz, e um destino negado pela RBAC é PASS quando a negação é a esperada. Ele não faz nenhuma mutação, e a sessão termina com logout comprovado. O invariante "sem conceder papel especializado ao MASTER" é provado assim: as permissões efetivas do MASTER são iguais antes e depois do vínculo, e o perfil atribuído é exatamente `leitor`.
5. **CONDICIONAL (18 casos em V123, eventos de auditoria).** A condição objetiva é que o evento do produtor apareça em V123 para a organização da Fase 3. Um caso só pode ficar `N_A_JUSTIFICADO` se cumprir três exigências:
   - a fonte no código mostra que o produtor não emite evento visível;
   - existe uma **emenda deste PLAN aprovada expressamente pelo titular** antes do REQUEST que fecha a matriz;
   - o caso não é contado como PASS.
6. **Consumidor de infraestrutura compartilhada** (por exemplo, `consultar_permissoes_efetivas`). A prova representativa é a tela de destino refletir o vínculo, sem mutação artificial.

Os erros são classificados como `UI`, `VALIDACAO`, `BACKEND` ou `PERMISSAO`. Se aparecer um defeito de produto, ele exige um PLAN de correção separado, sem adaptar o teste.

## 5. Gate quantitativo (seção 16.2)

- As 138 posições terminam em `PASS`, `FAIL`, `BLOCKED` ou `N_A_JUSTIFICADO`.
- `FAIL = 0`, `BLOCKED = 0` e `PASS = 100%` dos casos aplicáveis.
- Em todo caso aplicável, os dois negativos de leitura foram executados e bloqueados, e a duplicidade foi registrada para os 20 produtores.
- `cleanupStatus` de todos os casos é `ISOLATED_NO_DELETE` ou `NO_MUTATION`. A ausência de mutação fora da organização da Fase 3 está comprovada como descrito na seção 2.
- Não há erro global de transporte, de HTTP ou de página, exceto as exceções já certificadas (o logout 204 da R14).
- O logout do MASTER e o do 2º usuário estão comprovados na execução que fecha a matriz.

## 6. Pré-condição externa (ação do titular depois do merge deste PLAN)

O conector Supabase desta sessão não cria usuários de Auth, e não é permitido inserir em `auth.users` por SQL. Por isso, o titular:

1. No Supabase HML `gklhhhyosgasnyoxlrui`, em Authentication → Add user, cria o usuário com um e-mail sintético exclusivo, uma senha forte e "Auto Confirm User" marcado. O usuário fica sem perfil e sem vínculo inicial.
2. No GitHub `contaos999999/contaos-hml-control`, em Settings → Environments → `hml`, cria os secrets `CONTAOS_HML_SYNTHETIC_2_EMAIL` e `CONTAOS_HML_SYNTHETIC_2_PASSWORD`.
3. Escreve "usuário criado" na conversa. O agente não lê nem exibe esses valores.

Sem isso, os 26 casos de ADM01 ficam `BLOCKED`, e a Fase 3 não é certificada.

## 7. Arquitetura e arquivos fechados

### 7.1 Protocolo de solicitação única

Como o código está hoje:
- `SINGLE_REQUEST.fixtures.nonce` é a constante `trilha-a-fixtures-20261110-r20`;
- `parseSingleRequest` exige `request_id === SINGLE_REQUEST[operation].nonce`;
- a resolução de escopo por nonce existe só para `audit` (`resolveC8AuditScope`);
- o job `private` de `contaos-trilha-a-fixtures.yml` sempre executa `prepare-visual-fixtures.mjs --prepare-fixtures`, que tem a organização `e87f7e68` fixa.

O BUILD da Fase 3 muda o mínimo:

- **`scripts/hml/authenticated-visual-audit.mjs`.** Ganha a constante congelada `INTEGRACAO_V1_FASE3_SCOPE` (ID `INTEGRACAO_V1_FASE3_REL`, nonce `integracao-v1-fase3-rel-20261113-r1`). Ganha também a função `resolveFixturesScope(request)`, que retorna `TRILHA_A` para o nonce atual da Trilha A, `INTEGRACAO_V1_FASE3_REL` para o nonce F3 e falha fechado para qualquer outro. Na operação `fixtures`, `parseSingleRequest` passa a aceitar exatamente esses dois nonces. A operação `audit` não muda.
- **Exclusão mútua.** `prepare-visual-fixtures.mjs` falha fechado com `FIXTURES_SCOPE_NOT_TRILHA_A` se o escopo resolvido não for `TRILHA_A`. `integracao-v1-fase3.mjs` falha fechado com `FIXTURES_SCOPE_NOT_F3` se o escopo não for `INTEGRACAO_V1_FASE3_REL`. O passo de revalidação expõe o escopo, e o YAML executa só o passo correspondente. A verificação dupla impede que uma solicitação F3 altere a `e87f7e68` mesmo que o YAML falhe.
- **Testes RED obrigatórios.** Nonce F3 na operação `audit`. Nonce F3 já consumido. Nonce desconhecido. Escopo forjado. Getter ou proxy no request. Preparador da Trilha A com escopo F3. Executor F3 com escopo da Trilha A. Secrets do 2º usuário disponíveis em algum passo antes da barreira.

### 7.2 Executor e orçamento

O executor mutante novo fica em `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`, separado do auditor somente leitura. Por import, sem duplicar código, ele reutiliza a cerca nativa, o proxy de destino, o login, a seleção de organização, o logout e o padrão de livro de intenções com recibos `sealed`, `confirmed` e `uncertain`. Cada mutação tem um `requestId` idempotente e passa por reconciliação antes de qualquer repetição. Uma intenção incerta nunca é reenviada sem readback.

**Orçamento:** até 60 intenções de negócio no total da Fase 3 e até 30 por execução.

| Item | Intenções previstas |
|---|---:|
| Criar a organização | 1 |
| Vínculo do 2º usuário | 1 |
| 16 produtores de negócio (ordens 5 a 20; a preferência, ordem 3, é local e não conta) | 16 |
| Pré-requisitos finos confirmados no BUILD (por exemplo, solicitação de parecer) | até 5 |
| Tentativas de duplicidade | até 10 |
| **Total previsto** | **até 33** |

A folga até 60 cobre reconciliação e uma execução de recuperação. Toda tentativa enviada conta como intenção, inclusive as rejeitadas por duplicidade. Cada execução tem prazo de 45 minutos no job.

### 7.3 Ledger e regra C

O ledger incremental fica em `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json`. É append-only, e seu SHA-256 fica fixado no código. Valem as mesmas regras da Fase 2:
- um PASS com proveniência compatível é preservado (SHA de produto, harness e deployment, mais a ancestralidade);
- o caso que falhou nunca entra no ledger;
- um caso não executado nunca recebe PASS;
- os controles globais (sessões, MASTER, organização, logout, zero erros) nunca são herdados e são exigidos na execução que fecha a matriz;
- uma falha fatal interrompe a matriz.

### 7.4 Workflow (mudança autorizada e limitada)

Os jobs propostos na seção 16.2, `IFV1_F3_PROTOCOL` e `IFV1_F3_HML`, passam a ser os jobs já existentes `protocol` e `private` de `.github/workflows/contaos-trilha-a-fixtures.yml`. Nenhum workflow novo é criado.

O YAML só pode mudar nestes pontos:
- **(a)** os dois arquivos `integracao-v1-fase3*` entram no filtro `paths`;
- **(b)** no job `protocol`, os dois arquivos entram em `node --test`, `eslint` e `prettier --check`, sem remover nenhum passo existente;
- **(c)** no job `private` (environment `hml`), `CONTAOS_HML_SYNTHETIC_2_EMAIL` e `CONTAOS_HML_SYNTHETIC_2_PASSWORD` ficam disponíveis **somente no `env` do passo do executor F3**, depois de `--native-guard` e `--request-revalidate`, do mesmo jeito que o par da Trilha A;
- **(d)** os passos do preparador da Trilha A e do executor F3 passam a depender do escopo exposto pela revalidação (seção 7.1). Para isso, o passo `--request-revalidate` ganha `id` e um output `scope`. Sem escopo exposto, como no `workflow_dispatch`, em que a revalidação é pulada, nenhum dos dois executores roda. Teste RED: executor F3 fora de `workflow_run`.

Nenhuma outra mudança é permitida no YAML, nas permissões, nos gatilhos ou no environment.

### 7.5 Artefatos

Os artefatos são três: `F3_CASES.json` (catálogo derivado da matriz, conferido por SHA-256), `F3_REPORT.json` e `SHA256SUMS`. Cada recibo traz os campos da seção 16.2.

Três campos só existem depois do artefato: `artifactId`, `sha256` do ZIP e `reviewId`. Eles ficam nulos no relatório e são preenchidos no ledger e no certificado. Origem dos demais campos:
- `backendSha`: o baseline normativo `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, fixo no código do executor. Nenhuma leitura nova do repositório `develop` é feita;
- `frontendSha` e `deploymentId`: o pin;
- `harnessSha`: o commit do executor;
- `workflowRunId`: a run.

O relatório leva só IDs, enums, contadores e booleanos. Não leva DOM, texto livre, HTML, PNG, HAR, cookie, JWT, credenciais nem e-mail.

### 7.6 Arquivos fechados do BUILD

- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs` (novos);
- `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs` (apenas o que está na seção 7.1);
- `scripts/hml/prepare-visual-fixtures.mjs` e `scripts/hml/prepare-visual-fixtures.test.mjs` (apenas a guarda `FIXTURES_SCOPE_NOT_TRILHA_A` e o teste dela);
- `.github/workflows/contaos-trilha-a-fixtures.yml` (apenas os itens a–d da seção 7.4);
- `docs/frontend/auditorias/integracao-funcional-v1/fase3/**`, `PLANO_ATIVO.json` e o prefixo do checkpoint.

Continuam proibidos: `src/**`, `src/integrations/supabase/types.ts` (LOCK), `src/routeTree.gen.ts`, dependências e lockfile, backend, SQL, RLS, RPC, configuração de Auth, Storage, Edge e PROD. Este agente só lê o Supabase.

## 8. Separação de papéis

Em cada PR, implementador e revisor são identidades diferentes, e o revisor nunca edita o que revisa.

- **Nesta PR (#655):** a autora é `Edivan5002`. A revisão independente é feita por um agente revisor novo, somente leitura, e a aprovação é publicada pela identidade `contaos9999`.
- **Nas PRs seguintes da Fase 3:** aprova sempre a identidade que não é a autora da PR. Isso fica registrado no corpo de cada PR e no checkpoint.
- **Revisão canônica JSON do REQUEST:** segue a identidade que o auditor exige.

## 9. Sequência governada

1. **PLAN (este documento).** PR documental, revisão independente, checks, merge protegido e readback.
2. **Pré-condição do titular.** Seção 6.
3. **BUILD.** Os arquivos da seção 7.6, com TDD RED→GREEN. Além dos negativos da seção 7.1, os testes negativos cobrem:
   - catálogo incompleto, duplicado ou com hash divergente;
   - falso PASS;
   - campo livre ou credencial no relatório;
   - intenção acima do orçamento;
   - mutação em organização diferente da F3;
   - reenvio de intenção incerta sem readback;
   - mutação feita pelo 2º usuário;
   - perfil diferente de `leitor`.

   Os testes RED da emenda 1 estão na seção 12.6.

   Antes do merge: suíte completa, lint, as 18 nativas, checks no mesmo HEAD e revisão independente.
4. **Pins.** Deployment HML fixado por SHA (Ignored Build Step) e ledger inicial vazio, com SHA fixado.
   - **4-A. Conferência dos workers.** Antes de cada REQUEST, só por leitura, pelas condições da seção 12.4.
5. **REQUEST.** JSON de sete campos com operação `fixtures`, nonce F3 e pai igual ao merge do BUILD. A revisão canônica JSON é a última review no HEAD, e o merge é por merge commit. A execução é automática na attempt 1, sem dispatch, rerun ou cancelamento.
6. **Evidência.** Download e verificação do artefato (CRC, `SHA256SUMS`, schema e catálogo) e atualização do ledger por PR. Se a falha for parcial, os PASS válidos são preservados. A execução seguinte só sai por novo PLAN, BUILD ou REQUEST, com novo nonce.
7. **Emenda de N/A, se houver.** Aprovada pelo titular antes do REQUEST que fecha a matriz (seção 4, item 5).
8. **Certificado da Fase 3.** 138/138 terminais conforme a seção 5, revisão independente do artefato e certificado integrado por PR protegido, com readback.

## 10. Riscos e limites

- **V116 (`solicitar_analise_competencia`)** pode depender de worker ou de filas (R-02). A Fase 3 prova que o vínculo foi criado e pode ser observado; o fluxo do worker fica para a Fase 6. Se o vínculo depender de uma conclusão assíncrona, o caso registra a condição e o PLAN é emendado.
- **V122 (`registrar_relatorio_historico_hml`)** é um produtor específico de HML. A mutação fica na organização da Fase 3.
- **R-01.** Se V110, V111 ou V115 exigirem arquivo, usa-se um arquivo sintético mínimo de texto, gerado no job e sem nenhum dado real. Ele **não conta como prova de R-01**, que continua na Fase 6. Se a tela recusar esse arquivo, o caso fica `BLOCKED` e o PLAN é emendado.
- **R-03.** O isolamento completo entre organizações e perfis é tarefa da Fase 5. Aqui só entram os negativos de leitura e a sessão `leitor`, sem mutação.

## 11. Rollback

O rollback dos arquivos do BUILD é feito por PR. Os dados já criados ficam isolados na organização da Fase 3, sem exclusão, e constam do inventário do relatório. O vínculo do 2º usuário continua com o perfil `leitor` até a Fase 5. Nonce consumido nunca é reutilizado.

## 12. Emenda 1, 14/11/2026: pré-requisitos, orçamento, uploads e esperas assíncronas

**Origem.** A seção 3 manda o BUILD confirmar no código os pré-requisitos finos e transformar qualquer divergência em emenda. A seção 10 manda emendar o PLAN se um vínculo depender de conclusão assíncrona. No BUILD-2b-2a, as revisões R1 e R2 mostraram a causa raiz de seus achados: a cerca de mutação estava sendo desenhada antes do fluxo de rede dos produtores.

A revisão R1 desta emenda (PR #678, review 5905890909) achou a mesma causa no primeiro levantamento, que contava pré-requisitos sem inventariar cada requisição. Por isso, a fonte desta seção é o levantamento campo a campo `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_FLUXOS_PRODUTORES.md`, revisão 2. Ele foi feito no frontend e, com autorização do titular ("Autorizo só leitura (Recomendado)"), na leitura das definições das funções, dos gatilhos e de contagens agregadas do Supabase HML, sem nenhuma escrita. Se esta seção e o levantamento divergirem, prevalece o levantamento, e a divergência é defeito desta emenda.

**Decisão do titular.** Na conversa de execução de 14/11/2026, a pergunta foi como emendar o PLAN. Resposta literal: "Emenda completa (Recomendado)".

### 12.1 Pré-requisitos (substitui o teto de 5 da seção 7.2)

Até **11** pré-requisitos, todos ações de negócio feitas pela UI do MASTER na organização da Fase 3. Cada um é uma ação própria, com fluxo próprio no executor. Um único fluxo de pré-requisito por produtor não basta.

| Produtor | Pré-requisitos | Por que (fonte no levantamento, seção 3) |
|---|---|---|
| V107 | fonte normativa, versão por texto e aprovação humana (3) | `definir_aplicabilidade_fonte_v107` exige versão aprovada |
| V108 | proposta, versão com documento-base enviado por upload e uma rubrica (3) | `publicar_versao_proposta_v108` exige rascunho, rubrica e documento-base aprovado |
| V109 | `salvar_item` e `publicar_versao`, pelo mesmo `executar_comando_lista_v1` do produtor `criar_lista` (2) | `crud_lista_mutar_v1`. O item aponta para a versão de fonte aprovada em V107, com `obrigatorio` e `aplicavel` verdadeiros e `regra_validacao` `{"documento":{"obrigatorio":true}}` |
| V118 | `solicitar_parecer_interno` (1) | `aprovar_parecer_interno` exige parecer gerado |
| V119 | `aprovar_apresentacao` (1) | `registrar_apresentacao` exige `pode_apresentar_contratante` |
| V122 | upload e `criar_documento_contrato_completo` do relatório (1) | na UI, o registro só é liberado depois de o documento existir, estar aprovado e ter o processamento concluído |

Com o item de V109, a competência de V113 nasce com **um único requisito**, porque a organização e o contrato da F3 não têm regras de conformidade nem preventivas (`criar_organizacao` e o gatilho de V105 não as semeiam). V115 liga seu documento a esse requisito. V117 o revisa como `conforme`, citando como evidência a versão do documento de V115. Isso libera o portão e torna visível, no detalhe do requisito, o vínculo cobrado pelo caso C0415.

V119 não precisa de reanálise: a revisão de V117 grava uma execução `reanálise` `concluida` com o hash vigente e não altera nada que entre no snapshot da competência.

### 12.2 Orçamento (substitui a tabela da seção 7.2)

| Item | Intenções previstas |
|---|---:|
| Criar a organização | 1 |
| Vínculo do 2º usuário | 1 |
| 16 produtores de negócio (ordens 5 a 20) | 16 |
| Pré-requisitos da seção 12.1 | até 11 |
| Tentativas de duplicidade | até 10 |
| **Total previsto** | **até 39** |

O teto por execução sobe de 30 para **40**. O total da Fase 3 continua em **60**. Toda tentativa enviada conta como intenção, inclusive as rejeitadas por duplicidade. O job continua com 45 minutos, e a sessão do executor, com 40.

### 12.3 Uploads

Um upload conta dentro da ação de negócio que consome o arquivo, e não como intenção própria:
- o documento-base, no 2º pré-requisito de V108;
- os documentos de V110, V111 e V115;
- o relatório, no pré-requisito de V122.

O upload é composto por três requisições: Edge `storage-sign-upload`, envio ao Storage pela URL assinada e `confirmar_upload_arquivo`. A primeira requisição da ação sela a intenção no livro. Um upload sem o RPC que o consome não fecha a intenção, e um upload incerto nunca é repetido sem releitura.

O arquivo é sempre o sintético mínimo de texto da seção 10 (R-01), gerado no job e sem dado real, e continua sem contar como prova de R-01. A configuração do HML aceita `txt` com `text/plain`, e o limiar de envio resumível é de 100 MB. Se a Edge pedir envio resumível (TUS), a cerca bloqueia e o caso fica `BLOCKED` com `F3_UPLOAD_RESUMABLE`.

### 12.4 Esperas assíncronas e recuperação (complementa as seções 9 e 10)

**Cinco esperas.** O executor espera só por leitura, pela UI do MASTER. O prazo de cada uma conta a partir do selo da requisição que disparou o processo:

| Espera | O que espera | Prazo | Se vencer | Se recusar ou falhar |
|---|---|---:|---|---|
| W1 | verificador aprova o documento-base de V108 e o relatório de V122 | 8 min | `F3_WAIT_VERIFICADOR_PRAZO` | `F3_WAIT_VERIFICADOR_RECUSA` |
| W2 | verificador aprova o arquivo de V115, citado como evidência em V117 | 8 min | `F3_WAIT_VERIFICADOR_PRAZO` | `F3_WAIT_VERIFICADOR_RECUSA` |
| W3 | análise de V116 `concluida`, liberando a revisão de V117 | 6 min | `F3_WAIT_ANALISE_PRAZO` | `F3_WAIT_ANALISE_FALHA` |
| W4 | parecer gerado pelo job de IA de V118 | 6 min | `F3_WAIT_PARECER_PRAZO` | `F3_WAIT_PARECER_FALHA` |
| W5 | processamento documental do relatório de V122 `concluido` | 8 min | `F3_WAIT_PROCESSAMENTO_PRAZO` | `F3_WAIT_PROCESSAMENTO_FALHA` |

**Prazos.** A base está no levantamento, seção 4: as análises do HML levaram até 37 s, mas não há série histórica legível do verificador nem do parecer, então os prazos são margens fixas. O pré-requisito de V122 roda logo depois de V105, para que W1 e W5 corram durante os demais produtores. W2 e W3 correm em paralelo. No pior caso, as esperas somam 22 minutos no caminho crítico, dentro dos 40 minutos da sessão. O prazo da sessão sempre prevalece, e o que ele cortar fica com `F3_SESSION_DEADLINE`. Os prazos ficam fixos no módulo, como as demais âncoras.

**Se uma espera não concluir:**
- o caso dependente fica `BLOCKED` com o código da tabela;
- a intenção não é reenviada;
- os casos que não dependem dela seguem;
- um arquivo recusado pelo verificador também segue a seção 10: o caso fica `BLOCKED` e o PLAN é emendado.

V116 continua com o critério da seção 10: a análise criada e observável basta para os casos de V116, e o fluxo completo do worker continua na Fase 6.

**Recuperação.** Pelo gate da seção 5, um `BLOCKED` exige outra execução. Ela segue a seção 9, passo 6: novo PLAN, BUILD ou REQUEST, com **novo nonce**.
- O nonce `integracao-v1-fase3-rel-20261113-r1` é o da primeira execução e nunca é reutilizado (seção 11).
- Como `parseSingleRequest` só aceita os nonces fixados no código (seção 7.1), o nonce da recuperação entra por um BUILD próprio, revisado.
- O saldo do total de 60 é apurado pelo ledger. As intenções da primeira execução contam, e a recuperação só repete casos sem PASS preservado.

**Conferência dos workers antes de cada REQUEST (seção 9, passo 4-A).** Feita pelo agente, só por leitura no Supabase HML, e registrada no checkpoint com data e hora. O REQUEST só sai se todas as condições valerem:
1. `contaos-workers-rapidos`, `contaos-workers-pesados` e `contaos-worker-historico-v1-22` ativos, com execução bem-sucedida nos últimos 5 minutos e nenhuma falha nas últimas 24 horas;
2. nenhum arquivo `pendente` e nenhuma execução de análise `pendente` ou `processando` criados nas últimas 24 horas e com mais de 15 minutos;
3. nenhuma entrada nova em `jobs_dlq` nas últimas 24 horas;
4. os itens legados conhecidos (levantamento, seção 6) continuam fora da organização F3 e não são reavaliados.

Se alguma condição falhar, não há REQUEST. O impedimento é registrado e investigado pelo escalonamento de backend do `AGENTS.md`. Esta conferência não prova que cada item novo será processado. Esse risco fica coberto pelos códigos de espera.

### 12.5 Consequências para o BUILD-2b-2

- **Origem de cada valor variável.** A cerca de mutação passa a tipar cada posição variável do corpo, por passo, com a lista fechada da seção 1 do levantamento: `gerado_ui`, `gerado_harness`, `inventario`, `derivado`, `capturado`, `vinculado` e `usuario_sintetico`. Os campos literais são comparados literalmente. Um valor cuja origem não esteja declarada para aquela posição congela o livro.
- **Evento de vínculo no livro.** As chaves e os valores de cada envio ficam registrados no livro por um evento próprio. No reenvio, as posições `vinculado` são resolvidas pelo livro, e uma chave nova é recusada. Os produtores `sem chave` no levantamento (SYS04, V102, V103, V105, V113, V116, os dois RPCs de V118, `aprovar_apresentacao` e o RPC principal de V122) nunca são reenviados; só são relidos.
- **Fluxos.** Cada fluxo é declarado por produtor, tipo de intenção e ação, com fonte no código, e liga-se a uma linha da seção 3 do levantamento. As variantes também são declaradas: a repetição do ADM01 sem convite, o upload retomável e os dois RPCs da ação principal de V122.
- **Âncoras.** Os tetos (40 por execução, 11 pré-requisitos), os prazos e os códigos desta emenda ficam fixos no módulo. Na PR #679, `F3_BUDGET` deixa de ser `{ total: 60, perRun: 30, planned: 33, minutes: 45 }` e passa a refletir a seção 12.2, e `F3_MAX_PREREQUISITES` passa de 5 para 11.

### 12.6 Testes RED adicionais (complementa a seção 9, passo 3)

- espera vencida: caso `BLOCKED` com o código da espera, sem reenvio, e os casos independentes seguem;
- arquivo recusado pelo verificador: `F3_WAIT_VERIFICADOR_RECUSA`;
- Edge pede TUS: a cerca bloqueia com `F3_UPLOAD_RESUMABLE`;
- upload dentro da ação: as três requisições mais o RPC consumidor formam uma única intenção, e um upload sem RPC consumidor não fecha a intenção;
- 41ª intenção na execução e 12º pré-requisito: recusados (`F3_BUDGET`, `F3_INTENT_PREREQUISITES`);
- valor com origem não declarada para a posição: UUID da `e87f7e68`, outro usuário no ADM01, chave nova no reenvio e caminho de Storage fora do padrão da organização F3. Todos congelam o livro;
- reenvio de produtor `sem chave`: recusado; só a releitura é permitida;
- cada fluxo declarado no executor corresponde a uma linha do levantamento, e o teste falha se um fluxo não tiver linha ou uma linha não tiver fluxo. Essa é a barreira do NR-008 (seção 12.7).

### 12.7 Registro no P0-NR-001 (NR-008)

A classe NR-008 (retrabalho por correções sem atacar a origem causal) reapareceu no ciclo R1 e R2 do BUILD-2b-2a e no primeiro levantamento desta emenda. O registro é feito em duas PRs, porque o gate do ledger só aceita o estado `REINCIDENCIA` com testes novos que já existam no checkout:
- **Nesta PR (#678):** o NR-008 recebe `tentativas_ciclo` 2, `revisao_causal_ampliada` verdadeiro, `diagnostico_ampliado` apontando para o levantamento, a PR #679 em `origem` e o estado `PENDENTE_PR`, com a barreira nova declarada;
- **Na PR #679:** o estado passa a `REINCIDENCIA`, com `novos_testes` apontando para os testes da seção 12.6 no executor. O estado seguinte só muda com merge, CI e readback, pelo P0-NR-001.

### 12.8 O que não muda

Esta emenda não muda nada do seguinte:
- os casos, o catálogo `F3_CASES.json` e o gate da seção 5;
- a lista fechada da seção 7.6 e as proibições;
- o nonce da primeira execução, `integracao-v1-fase3-rel-20261113-r1`, e a regra de nonce novo por execução das seções 9 e 11;
- o ledger vazio e o protocolo de solicitação única.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Esta fase altera só o instrumento de auditoria e a documentação. A marca ContaOS Brand v1.0, o Design System e os assets ficam preservados, e o impacto visual é N/A. O agente Lovable não é usado.

## 13. Proposta de emenda posterior: certificação de código e GATE PROD (22/11/2026)

A separação de certificação de código V1–V5 e contraprovas LIVE exclusivas de GATE PROD está detalhada em `docs/frontend/planos/IFV1_F3_CODE_VS_GATED_PROD_LIVE_EMENDA_2026-11-22.md`. Essa emenda só produz efeitos normativos após PR protegida, CI e revisão independente. Até então, os requisitos HML e a regra quantitativa da seção 5 continuam vigentes. A emenda não autoriza preencher artificialmente o ledger, dispensar qualquer um dos 138 casos, ou liberar F4 sem certificado CODE próprio.

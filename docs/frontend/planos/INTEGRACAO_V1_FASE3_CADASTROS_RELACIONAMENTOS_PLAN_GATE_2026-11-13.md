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

   Ele não faz nenhuma mutação, e a sessão termina com logout comprovado. O invariante "sem conceder papel especializado ao MASTER" é provado assim: as permissões efetivas do MASTER são iguais antes e depois do vínculo, e o perfil atribuído é exatamente `leitor`.
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
| 17 produtores de negócio (ordens 5 a 20, menos a preferência, que é local e não conta) | 17 |
| Pré-requisitos finos confirmados no BUILD (por exemplo, solicitação de parecer) | até 5 |
| Tentativas de duplicidade | até 10 |
| **Total previsto** | **até 34** |

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
- **(d)** os passos do preparador da Trilha A e do executor F3 passam a depender do escopo exposto pela revalidação (seção 7.1).

Nenhuma outra mudança é permitida no YAML, nas permissões, nos gatilhos ou no environment.

### 7.5 Artefatos

Os artefatos são três: `F3_CASES.json` (catálogo derivado da matriz, conferido por SHA-256), `F3_REPORT.json` e `SHA256SUMS`. Cada recibo traz os campos da seção 16.2.

Três campos só existem depois do artefato: `artifactId`, `sha256` do ZIP e `reviewId`. Eles ficam nulos no relatório e são preenchidos no ledger e no certificado. Origem dos demais campos:
- `backendSha`: o baseline normativo `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, mais o HEAD de `contaos999999/develop` lido pela API no job `request`;
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

   Antes do merge: suíte completa, lint, as 18 nativas, checks no mesmo HEAD e revisão independente.
4. **Pins.** Deployment HML fixado por SHA (Ignored Build Step) e ledger inicial vazio, com SHA fixado.
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

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Esta fase altera só o instrumento de auditoria e a documentação. A marca ContaOS Brand v1.0, o Design System e os assets ficam preservados, e o impacto visual é N/A. O agente Lovable não é usado.

# ContaOS 4.1 — Plano mestre consolidado da auditoria de integração funcional V1 (7 fases)

> **Estado documental:** consolidação proposta para revisão independente. A estrutura de sete fases foi aprovada pelo titular em conversa anterior, mas não foi encontrado na `main` um documento único com o detalhamento original integral das sete fases. **Este texto não se apresenta como reprodução literal desse original.** Os critérios detalhados das Fases 3–7 abaixo são uma **proposta de operacionalização sujeita à validação do titular e revisão independente**. Não alteram certificados, gates ou planos já aprovados.

## 1. Fontes, precedência e limites

1. Fonte de verdade operacional: `main` protegida de `contaos999999/contaos-hml-control`, certificados, artefatos, PRs e reviews verificáveis.
2. Fase 1: `docs/frontend/auditorias/integracao-funcional-v1/fase1/PLANO.md`, `CERTIFICADO.md`, `TELAS.csv`, `CONEXOES.csv`, `inventario.json`, `GRAFO.mmd`, verificadores e evidências.
3. Fase 2: `docs/frontend/auditorias/integracao-funcional-v1/fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md`, `NAV_LEDGER.json`, planos e emendas R1–R14, evidências das execuções e `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.
4. As certificações anteriores da V1, os contratos normativos e os gates vigentes têm precedência sobre qualquer sugestão neste plano.
5. Nenhuma fase pode receber PASS apenas porque seu código existe, porque outro plano foi certificado ou porque CI não executou a prova de runtime exigida.
6. A sequência é **1 → 2 → 3 → 4 → 5 → 6 → 7**. O trabalho já certificado não deve ser reaberto sem prova concreta de invalidação por mudança de escopo, código, contrato ou evidência.

## 2. Painel consolidado na data da criação

| Fase | Escopo | Estado comprovável | Fonte/observação |
|---|---|---|---|
| 1 | Inventário e matriz de conexões | **CERTIFICADA (escopo estático)** | `fase1/CERTIFICADO.md`; inventário de 27 telas do núcleo, 29 superfícies totais, 812 pares direcionados |
| 2 | Navegação funcional autenticada | **CERTIFICADA (escopo de navegação)** | `fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md`; ledger v5, 52/52 PASS, R14 com controles globais |
| 3 | Cadastros e relacionamentos | **SEM CERTIFICADO ESPECÍFICO IDENTIFICADO** | Escopo proposto abaixo; verificar novamente o GitHub antes de iniciar |
| 4 | CRUD e sincronização | **SEM CERTIFICADO ESPECÍFICO IDENTIFICADO** | Não confundir com certificação anterior da Trilha B |
| 5 | RBAC/RLS e isolamento entre organizações | **SEM CERTIFICADO ESPECÍFICO IDENTIFICADO** | Não confundir com provas anteriores de segurança |
| 6 | Fluxos funcionais integrados | **SEM CERTIFICADO ESPECÍFICO IDENTIFICADO** | Dependente das fases anteriores |
| 7 | Consolidação e certificação global | **NÃO CERTIFICADA NESTE PLANO** | Exige recibos independentes das sete fases |

O estado acima é uma fotografia documental; toda execução deve consultar novamente o GitHub real. O histórico antigo da Fase 2 (R7, PR #628) não prevalece sobre o certificado posterior integrado.

## 3. Fase 1 — Inventário e matriz de conexões (escopo documental existente)

**Objetivo:** inventariar telas/rotas, componentes, consultas, tabelas, RPCs, Edge Functions, produtores e consumidores; mapear relações obrigatórias, condicionais e não aplicáveis; produzir grafo e verificar órfãs.

**Prova e gate:** arquivos e verificador da pasta `fase1/`, hashes, revisão independente, CI e merge protegido. O certificado limita-se ao mapa estático: não prova navegação, CRUD, RLS ou fluxo ponta a ponta.

**Situação:** certificação documentada; preservar integralmente. Somente revalidar se houver impacto comprovado.

## 4. Fase 2 — Navegação funcional (escopo documental existente)

**Objetivo:** verificar sessão autenticada MASTER, sidebar, rotas, recargas, retorno, links, transições, estados e logout em 26 superfícies privadas × desktop 1440 e mobile 390 = 52 casos.

**Prova e gate:** ledger de evidências por caso, provenance do frontend/harness/deployment, nonce única, guard nativo, controles globais, erros zero, logout e revisão independente. A preservação incremental exige compatibilidade de SHA, ancestralidade e análise de impacto.

**Situação:** certificado integrado em `fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md`, produto `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97`, deployment `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`, ledger v5 52/52. R10 run `43459877744` (casos 1–51 preservados) e R14 run `43509322900` (caso 52 e controles globais). Não reabrir por causa de resultados históricos anteriores.

## 5. Fase 3 — Cadastros e relacionamentos (**PROPOSTA A VALIDAR**)

**Objetivo proposto:** comprovar que os cadastros V1 produzem vínculos íntegros e utilizáveis por telas consumidoras, em uma ou mais organizações sintéticas, sem interferir em dados reais.

**Atividades propostas:** selecionar do inventário da Fase 1 os relacionamentos obrigatórios; estabelecer matriz origem → entidade → consumidor; criar/ler vínculos em HML controlado; validar chaves estrangeiras, referências, filtros e estados vazio/inválido; confirmar propagação aos consumidores.

**Gate proposto:** cobertura rastreável dos vínculos obrigatórios aplicáveis, evidências de execução e negativos, nenhuma referência órfã indevida, revisão independente, CI e PR protegido. Antes do BUILD, submeter plano detalhado com casos, fixtures, métricas e limites ao titular.

## 6. Fase 4 — CRUD e sincronização (**PROPOSTA A VALIDAR**)

**Objetivo proposto:** comprovar persistência e sincronização real das operações autorizadas entre telas, cache e backend, inclusive após recarga.

**Atividades propostas:** mapear CRUD permitido por entidade/perfil; testar criar, consultar, atualizar e excluir/arquivar quando autorizado; verificar reflexos em listagens, detalhes e consumidores; testar concorrência, invalidação de cache, idempotência, falha de rede e rollback quando aplicável.

**Gate proposto:** matriz CRUD com positivos e negativos, persistência comprovada, nenhuma divergência silenciosa, zero mutação fora de escopo, rastreio de fixtures e auditoria independente. Certificação anterior da Trilha B é evidência candidata, não PASS automático desta fase.

## 7. Fase 5 — RBAC, RLS e isolamento entre organizações (**PROPOSTA A VALIDAR**)

**Objetivo proposto:** comprovar, nos fluxos integrados, que identidade, papel e organização limitam corretamente leitura, mutação, consulta e navegação.

**Atividades propostas:** construir matriz papel × recurso × ação × organização; testar MASTER e perfis limitados; testar duas organizações sintéticas; tentar acesso cruzado por UI, rota direta e chamadas autorizadas do teste; verificar bloqueio fail-closed e ausência de vazamento em cache ou resposta.

**Gate proposto:** negativas efetivamente negadas, positivas permitidas, nenhum acesso entre organizações, logs sem segredos/PII, evidência verificável e revisão independente. Não modificar políticas RLS/RBAC para fazer teste passar.

## 8. Fase 6 — Fluxos funcionais integrados (**PROPOSTA A VALIDAR**)

**Objetivo proposto:** validar jornadas completas que atravessam múltiplas telas e entidades, da origem ao resultado persistido, incluindo estados de falha e retomada.

**Atividades propostas:** selecionar jornadas críticas a partir da matriz de conexões; definir pré-condições e pós-condições; executar cenários reais em HML com fixtures; verificar transições, persistência, consistência, autorização, erros, auditoria e recuperação; medir lacunas e reexecutar somente impactos demonstrados.

**Gate proposto:** cobertura aprovada das jornadas críticas, evidência de ponta a ponta, ausência de falhas impeditivas, controles globais preservados, revisão independente e recibo integrado.

## 9. Fase 7 — Consolidação e certificação global (**PROPOSTA A VALIDAR**)

**Objetivo proposto:** reconciliar os seis certificados anteriores e demonstrar que formam um conjunto consistente, íntegro e compatível com o HEAD e o ambiente certificados.

**Atividades propostas:** conferir certificados, reviews, SHAs, PRs, workflows, artifacts, hashes, matriz de rastreabilidade, pendências e impactos cruzados; executar regressão transversal se houver impacto; emitir parecer independente.

**Gate proposto:** Fases 1–6 com certificados válidos e integrados, sem impedimentos abertos que invalidem o escopo global; cadeia de evidências e ancestry verificadas; aprovação independente; certificado global por PR protegido e readback da `main`. **Não confundir esta certificação com autorização para PROD ou com GATE PROD 1.**

## 10. Protocolo operacional por fase pendente

1. **RECUPERAR:** consultar HEAD atual, documentos normativos, matriz da Fase 1, certificado da Fase 2 e alterações recentes. Registrar riscos e dependências.
2. **PLAN:** para Fases 3–7, submeter detalhamento dos critérios propostos para validação antes de executá-los como critérios canônicos. PR documental com revisão independente e CI.
3. **BUILD:** agente implementador em branch própria; teste RED demonstrando falha real, GREEN demonstrando correção quando aplicável, testes negativos e regressões. Não alterar contratos sem gate.
4. **REVIEW:** identidade independente revisa o mesmo SHA; `CHANGES_REQUESTED` bloqueia merge até correção e nova aprovação.
5. **HML:** conferir frontend/harness/backend/deployment; usar credenciais e fixtures autorizadas, nunca dados de produção; respeitar nonce única e limites do workflow.
6. **EVIDENCE:** salvar relatórios, artefatos, hashes, casos, logs sanitizados e resultado dos controles; não declarar PASS em jobs `skipped`.
7. **CERT:** publicar certificado da fase somente com provas completas, review independente, checks, merge protegido e readback.
8. **CONTINUAR:** registrar checkpoint oficial e seguir à próxima fase; não refazer trabalho certificado sem impacto.

## 11. Regras de segurança e preservação

Zero-Drift, LOCK, branch protection, RBAC, RLS, isolamento entre organizações, autenticação, privacy, guard nativo, provenance, nonces e fail-closed são obrigatórios. Proibido ocultar erros, forçar PASS, ampliar timeouts sem causa, falsificar hashes, reutilizar nonce, fazer merge sem review ou converter testes locais em prova HML.

**Separação de papéis:** implementador corrige e submete; auditor independente revisa, não modifica o código auditado e só certifica com evidência suficiente.

## 12. Continuidade e próxima tarefa

**Última fase com certificado localizado:** Fase 2, certificado de navegação 52/52 integrado à `main`.

**Próxima tarefa proposta:** recuperar do histórico qualquer detalhamento original da Fase 3; confrontá-lo com a proposta desta consolidação; obter validação formal dos critérios antes de iniciar sua implementação. Se os critérios originais não forem recuperáveis, solicitar aprovação explícita do detalhamento proposto. Não afirmar que o original foi recuperado.

Em cada checkpoint registrar HEADs, PRs, reviews, workflows, resultados, artefatos, impedimentos e próxima ação. Comentário em PR não é equivalente a documento integrado na `main`.

## 13. Registro completo das decisões desta conversa e reconciliação histórica

Esta seção registra explicitamente as decisões, discussões, exigências, falhas e resultados mencionados nesta conversa. **O registro de uma decisão ou incidente não implica que tenha sido validado como gate canônico**, salvo quando a fonte integrada assim o comprova.

### 13.1. Decisão do titular e fronteira do plano

- O titular aprovou a auditoria de integração funcional em **sete fases sequenciais**, destinada a provar que as 27 telas V1 realmente se comunicam, e não apenas que telas ou CRUD isolados existem.
- O trabalho deve preservar o que já foi comprovadamente certificado; não reabrir automaticamente fases antigas, nem confundir esta auditoria com o plano anterior de **oito fases** da certificação geral V1.
- O plano deve existir em **um único documento recuperável no GitHub**, com detalhamento de objetivos, atividades, casos, evidências, critérios de aceite, dependências, responsáveis, status e próximo passo de cada fase.
- Execução autônoma significa investigar, corrigir e continuar dentro das permissões; **não** autoriza contornar proteções, reviews, credenciais, gates ou requisitos de aprovação.
- O agente implementador e o revisor independente devem atuar em identidades/sessões distintas. O revisor não deve editar o código que audita.
- Uma fase só muda para **CERTIFICADA** com certificado válido, artefatos, revisão independente, checks e integração à `main` quando exigidos.
- O usuário solicitou que o Claude recupere o plano e execute as fases em sequência. Esta consolidação é o ponto de entrada para essa recuperação, mas os detalhamentos propostos das fases 3–7 continuam sujeitos à validação formal, porque o documento original integral não foi encontrado.

### 13.2. Fase 1: escopo, provas e limitações

O plano existente em `fase1/PLANO.md` estabelece inventário de rotas, componentes, tabelas, RPCs, Edges, produtores/consumidores, grafo e candidatos a órfãs; os dados e verificadores ficam em `fase1/`.

O certificado registra: 27 telas do núcleo, 29 superfícies, 28 rotas, 26 privadas; 204 referências, 54 nomes de RPC, 171 fontes frontend, 577 relações e 812 pares direcionados; verificador e testes negativos. Esses números descrevem a **auditoria estática**, não um PASS de integração runtime.

**Dependência de saída:** o catálogo e a matriz da Fase 1 são a base para selecionar casos das fases seguintes; divergência posterior precisa de análise de impacto, não reinício automático.

### 13.3. Fase 2: cronologia de incidentes, decisões e certificação posterior

1. **R1:** execução autenticada parcial e falha; checkpoint histórico `fase2/CHECKPOINT_CONTINUIDADE_2026-11-12.md` e Issue #604. O checkpoint antigo não deve substituir o certificado posterior.
2. **R7:** PLAN #621, BUILD #622, pin #624 e REQUEST #625. Execução `43358055422`, job `131665158901`, artefato `14008077669`: 52 previstos, 26 observados, 25 PASS, 1 FAIL (V110/390), 26 não executados. Falha `FENCE_DRAIN_TIMEOUT`, três GET API `ABORTED`, `LINK_CLICK` para SYS04, logout não comprovado. A nonce R7 foi consumida.
3. **R8 PLAN:** PR #626 integrada, com emenda de certificação incremental. Protocolo: preservar PASS apenas com proveniência, hash, compatibilidade de produto/harness, ancestralidade e análise de impacto; ledger append-only, retomar no primeiro caso inválido/FAIL, revalidar casos impactados e controles globais a cada execução. Exemplo de falha futura no caso 30 era hipotético, **não** resultado observado.
4. **R8 ledger:** PR #627 foi aberta para implementação do ledger e verificação de artefatos. Seu estado atual deve ser consultado; não pressupor merge ou certificação por sua mera existência.
5. **R8 correção inicial:** PR #628, commit `c9702f8ae53ebe780c20d319fc89328aa917bb0d`, adicionou espera de rede antes de `LINK_CLICK`. O revisor independente `Edivan5002` emitiu **CHANGES_REQUESTED**, review `5886230176`: hipótese não comprovada, espera redundante, nenhum RED/GREEN, jobs autenticados reais skipped. A aprovação de LOCK/Zero-Drift/fixtures de protocolo não provava a execução V110/390.
6. **Diagnóstico do revisor:** `fence.drain()` exige zerar handlers Fetch, registros de ciclo de vida e associações pendentes; os três GET abortados não bastam para explicar timeout. O relatório não indicava qual contador/requisição ficou presa nem se o drain falhou antes/depois do clique. A investigação exigia contadores, fase e resumo sanitizado de registros, sem URL/header/corpo; teste RED, GREEN e negativos de ausência de terminal, transporte genuíno e frame estranho.
7. **Ajuste da PR #628:** commit `e5eb2297a4096e3c638c7ad6a2685bb2cae2e282` removeu a espera redundante e instrumentou contadores de timeout. Os jobs `43367558650` e `43367558740` falharam porque o diagnóstico anterior passou a incluir `drainTimeout:null`, quebrando um teste de compatibilidade.
8. **Correção de compatibilidade:** commit `5c774623149d05a022c66c87e8c0812572a259af` limitou o campo novo ao código `FENCE_DRAIN_TIMEOUT`. No momento da verificação relatada nesta conversa, LOCK `43368116031` e Zero-Drift `43368116047` estavam SUCCESS, enquanto Fixtures `43368116010` e Trilha A Autenticada `43368116062` estavam FAILURE. Não havia justificativa para declarar a PR aprovada.
9. **Evolução posterior já integrada à main, descoberta ao consolidar este plano:** o certificado `fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md` registra PLAN R14 #649, BUILD #650, REQUEST #651, produto `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97`, deployment `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`, ledger v5 SHA-256 `6eeef70b5d194cfe388666096dd3a4b493e89c7b9259248a98b4ef212745afd4`, 52/52 PASS. R10 `43459877744` sustenta os casos 1–51 e R14 `43509322900` o caso 52 e controles globais.
10. **Causa posterior comprovada para erro global de logout:** o certificado R14 documenta POST `/auth/v1/logout` com HTTP 204 observado antes do `ERR_ABORTED` do Chromium. A exceção autorizada limita-se a esse caso exato, com prova de resposta 204, sem ignorar outros abortos nem relaxar fence/guard. **Não retroprojetar essa causa ao incidente V110/390 da R7 sem evidência.**

**Regra de precedência:** o resultado histórico `CHANGES_REQUESTED` da PR #628 e as falhas de CI são fatos relevantes, mas **não anulam automaticamente** a certificação posterior R14 integrada, que tem sua própria cadeia de provas. Conferir integridade, ancestralidade e readback antes de qualquer decisão de reabertura.

### 13.4. Quadro de evidências mínimas para cada fase pendente

| Evidência | Fase 3 | Fase 4 | Fase 5 | Fase 6 | Fase 7 |
|---|---|---|---|---|---|
| Matriz de escopo rastreada à Fase 1 | Obrigatória | Obrigatória | Obrigatória | Obrigatória | Consolidar |
| Casos positivos e negativos | Vínculos | CRUD/cache | Permissões/isola. | Jornadas | Verificar |
| Identidade de HML e fixtures sintéticas | Sim | Sim | Sim | Sim | Conferir |
| Proveniência (HEAD, harness, deploy, backend) | Sim | Sim | Sim | Sim | Reconciliar |
| Testes RED/GREEN quando há correção | Sim | Sim | Sim | Sim | Se houver impacto |
| Evidências de persistência e estado final | Sim | Sim | Conforme ação | Sim | Consolidar |
| Revisão independente no SHA correto | Sim | Sim | Sim | Sim | Sim |
| CI obrigatório + merge protegido + readback | Sim | Sim | Sim | Sim | Sim |
| Certificado e checkpoint canônicos | Sim | Sim | Sim | Sim | Global |

**Importante:** esta tabela é proposta de critérios operacionais a aprovar para Fases 3–7; não deve ser confundida com texto integral do plano original.

### 13.5. Critérios detalhados propostos para a Fase 3

- Partir de `TELAS.csv`, `CONEXOES.csv`, `inventario.json` e dos contratos de dados, sem escolher apenas caminhos fáceis.
- Catalogar cadastro mestre, detalhe, relacionamento 1:N/N:N e consumidores efetivos; classificar obrigatório, condicional e N/A.
- Para cada vínculo aplicável: criar fixture sintética autorizada; confirmar persistência; abrir consumidor; conferir entidade, organização e atualização após recarga; testar referência inexistente, duplicação e relação não autorizada.
- Separar erro de interface, validação, backend e permissão; registrar rastreio caso → tela → entidade → operação → evidência.
- Gate: cobertura e exceções aprovadas previamente, zero violação de integridade e isolamento, review independente e certificado integrado.

### 13.6. Critérios detalhados propostos para a Fase 4

- Matriz por recurso e papel com `CREATE`, `READ`, `UPDATE`, `DELETE/ARCHIVE` somente onde permitido pelo contrato.
- Provar reflexo entre listagem, detalhe e telas relacionadas; recarga e nova sessão; sincronização do cache e respostas de erro.
- Negativos: edição sem permissão, ID inexistente, versão concorrente, erro de rede, repetição da operação, exclusão com dependência e vazamento de cache entre organizações.
- Preservar dados de produção e evitar mutações irreversíveis; usar dados sintéticos e cleanup verificável.
- Gate: persistência e consistência demonstradas, falhas tratadas, nenhum acesso indevido e certificado independente.

### 13.7. Critérios detalhados propostos para a Fase 5

- Matriz papel × recurso × ação × organização derivada dos contratos RBAC/RLS, com MASTER e perfis restritos.
- Duas organizações sintéticas com dados distintos; testar UI, rota direta e operações de dados no limite de permissões; verificar que nenhum recurso de outra organização é retornado.
- Incluir tentativas negativas para leitura, escrita, associação cruzada, filtros manipulados e cache de sessão anterior; preservar logs sanitizados.
- Gate: todos os negativos críticos bloqueados, positivos autorizados, nenhuma flexibilização de política e revisão independente.

### 13.8. Critérios detalhados propostos para a Fase 6

- Definir jornadas a partir de cadeias reais do grafo: origem → cadastro/relacionamento → alteração autorizada → consumidor → evidência final.
- Cobrir desktop/mobile onde pertinente, recarga, retomada, erro de transporte, controle de sessão, consistência entre telas e isolamento.
- Registrar precondição, sequência, asserts, pós-condição e cleanup; manter artefatos e hashes para replay controlado.
- Gate: cobertura aprovada das jornadas críticas, zero falha impeditiva e certificado independente.

### 13.9. Critérios detalhados propostos para a Fase 7

- Validar certificados 1–6 e seus SHA/artefatos, revisões, CI, deploy e compatibilidade de baseline.
- Construir matriz única `requisito → tela → conexão → caso → artefato → certificado`; identificar gaps, impactos de mudanças e riscos aceitos.
- Emitir parecer independente de integração funcional V1; certificação global somente com os sete gates satisfeitos e documento integrado.
- A certificação global **não autoriza PROD**; GATE PROD 1 é projeto distinto, com suas próprias fases e critérios.

## 14. Checklist obrigatório para o agente executor (Claude/Work/Codex)

1. Ler este plano **inteiro**, sem tomar a seção de resumo como substituta dos documentos de evidência.
2. Conferir HEAD da `main` e documentos de Fases 1 e 2; verificar certificado R14 e ledger v5 no GitHub.
3. Pesquisar histórico de comentários/PRs por critérios originais das Fases 3–7. Se encontrar conteúdo aprovado anterior, propor emenda que **preserve exatamente** os critérios originais e explique divergências.
4. Não declarar que a proposta das Fases 3–7 já foi aprovada. Submeter detalhamento PLAN da Fase 3 à aprovação exigida, sem editar produto antes do gate.
5. Executar PLAN → BUILD → revisão independente → CI → HML → evidências → certificado → checkpoint, em sequência.
6. Não repetir Fases 1–2 sem causa documentada de invalidação.
7. Se algum controle não puder ser executado, registrar BLOCKED, o motivo e a ação desbloqueadora; não simular sucesso.
8. A cada avanço, atualizar painel das sete fases e registrar HEADs, PRs, reviews, runs, artefatos e próxima tarefa.
9. Antes de recomendar troca de conversa, integrar e verificar checkpoint canônico e preparar prompt completo de continuidade.
10. Finalizar apenas com certificação global válida ou impedimento concreto explicitamente documentado.

## 15. Aceite deste plano mestre

Este arquivo consolida o que está documentado e discutido nesta conversa, mas **não reescreve retroativamente o plano original não localizado**. Para torná-lo referência canônica operacional:

1. Revisar a fidelidade das Fases 1 e 2 frente aos certificados existentes.
2. Validar expressamente a proposta detalhada das Fases 3–7 ou substituí-la por critérios originais recuperados e comprovados.
3. Obter revisão independente e checks no HEAD da PR documental.
4. Integrar por merge protegido e confirmar readback do arquivo na `main`.
5. Registrar no checkpoint a versão aprovada e a próxima fase autorizada.

Até lá, o documento é uma **proposta consolidada em PR**, não um plano mestre aprovado e integrado.

## 16. Resposta verificável à revisão independente da PR #653 (review `5899000831`)

Esta seção atende especificamente aos bloqueios B1–B4 da revisão `CHANGES_REQUESTED`. O revisor continua independente: estas emendas são do **implementador documental** `contaos9999`; a validação pertence a `Edivan5002`. Uma correção documental não revoga automaticamente o review, não libera merge e não autoriza execução de fases ainda sem aceite do titular.

### 16.1 B1 — Matriz de proveniência e distinção entre original e proposta

| Fase | Requisito, atividade ou gate | Fonte verificável | Prova de aprovação | Natureza | Consequência |
|---|---|---|---|---|---|
| Todas | Estrutura sequencial de sete fases | `fase1/PLANO.md` e `fase2/CHECKPOINT_CONTINUIDADE_2026-11-12.md` | Registros declaram aprovação anterior pelo titular; documento integral original não anexado | **Estrutura aprovada, texto original incompleto** | Preservar ordem, não imputar aceite de novos detalhes |
| Todas | Não reabrir oito certificações anteriores | `fase1/PLANO.md` e `fase1/RELATORIO.md` | Declaração expressa nos registros integrados | **Original documentado** | Certificações anteriores não equivalem aos sete gates |
| 1 | Inventariar telas, RPCs, produtores e consumidores | `fase1/PLANO.md` | `fase1/CERTIFICADO.md` | **Original e certificado** | Nenhum replanejamento |
| 1 | Cobertura de 27 núcleo / 29 superfícies / 812 pares | `fase1/CERTIFICADO.md`; `TELAS.csv`; `CONEXOES.csv` | Certificado integrado | **Prova estática certificada** | Sem inferir runtime |
| 2 | Navegação autenticada, 26 superfícies × 2 resoluções | `fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md` | Certificado integrado, ledger v5 | **Original e certificado** | Preservar 52/52 |
| 2 | Nonce, ledger, proveniência e controles globais | PLAN R8 #626, PLAN R14 #649, BUILD #650, REQUEST #651 e certificado | PRs/artefatos do histórico de Fase 2 | **Controles documentados nesse escopo** | Não transplantar formatos técnicos sem PLAN futuro |
| 3 | Cadastros e relacionamentos | Estrutura aprovada da conversa, correspondência `CONEXOES.csv` com `fases_validacao=3` | Não foi localizado aceite integral dos casos | **Tema original; casos e gates propostos** | Exige validação do titular antes do PLAN executável |
| 4 | CRUD e sincronização | Estrutura aprovada da conversa, `fases_validacao=4` | Não foi localizado aceite integral dos casos | **Tema original; casos e gates propostos** | Não confundir com Trilha B |
| 5 | RBAC/RLS e isolamento | Estrutura aprovada da conversa, `fases_validacao=5`, riscos R-03 | Não foi localizado aceite integral dos casos | **Tema original; casos e gates propostos** | Requer cobertura multi-organização real em HML |
| 6 | Fluxos funcionais integrados | Estrutura aprovada da conversa, `fases_validacao=6`, riscos R-01/R-02 | Não foi localizado aceite integral dos casos | **Tema original; casos e gates propostos** | Seleção de jornadas deve vir do mapa real |
| 7 | Consolidação e certificação global | Estrutura aprovada da conversa, certificados F1/F2 | Não foi localizado aceite integral dos casos | **Tema original; critérios e gate propostos** | Sem certificado global antecipado |
| 3–6 | Matriz de 138 conexões, IDs de casos estáveis e 552 posições previstas | `fase1/CONEXOES.csv`, derivação explicitada na seção 16.2 | Inventário de origem estático certificado; execução dos casos **não aprovada** | **Fonte original + nova proposta rastreada** | Não atribuir PASS ou exigir execução sem PLAN aprovado |
| 3–7 | Fixtures, limpeza, evidências, limites e formatos sugeridos abaixo | Esta PR #653 | **Ainda não aprovados pelo titular** | **Proposta** | Submeter aceite expresso |
| 5–6 | R-01, R-02, R-03 | `fase1/CERTIFICADO.md` | Reconhecimento documental de limitações | **Riscos originais preservados** | Não converter em PASS por referência |

**Lacuna documental L-01:** não foi recuperado na `main` um arquivo contendo a redação integral original das Fases 3–7. Esta revisão não a fabrica. O autor do plano deve anexar fonte adicional existente, ou o titular aprovar expressamente as novas propostas para o documento se tornar normativo. Nenhum review técnico substitui essa manifestação do titular.

### 16.2 B2 — Catálogo executável derivado das conexões reais

**Anexo rastreável:** [`INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv`](INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv).

Este anexo foi derivado de `docs/frontend/auditorias/integracao-funcional-v1/fase1/CONEXOES.csv` usando **somente linhas cujos tokens de `fases_validacao` incluem 3, 4, 5 ou 6**. O arquivo-fonte contém 577 relações; foram selecionadas **138 relações distintas**, das quais **120 OBRIGATORIA** e **18 CONDICIONAL**; todas as 138 estão indicadas para **cada uma das quatro fases** (3–6), gerando **552 posições de caso propostas**, não 552 testes já executados. As demais 439 relações do inventário não foram inventadas nem descartadas: seus tokens de fase não as incluem neste subconjunto. Cada linha do anexo preserva origem, destino, classe, tipo, invariantes, produtor/consumidor, caminhos de evidência e o ID `Cxxxx` original. Exemplo: `IFV1-F3-C0002` corresponde à conexão `C0002`, `ADM01 → SYS04`. As provas de Fase 2 permanecem no ledger original.

**Semântica proposta de cada posição de caso:**

| Prefixo | Preparação | Ação positiva | Assert principal | Negativo e cleanup |
|---|---|---|---|---|
| `IFV1-F3-Cxxxx` | Resolver produtor, consumidor, contrato e pré-condições do ID `Cxxxx` | Criar/associar cadastro sintético autorizado na origem; observar no destino | Integridade do vínculo e chave/organização corretas | Referência inválida/não autorizada; remover fixture ou documentar rollback |
| `IFV1-F4-Cxxxx` | Validar quais operações CRUD são legalmente oferecidas pela entidade | Exercitar CRUD permitido e observar sincronização no consumidor | Persistência, estado pós-recarga, cache consistente | Requisição inválida, concorrência e proibição; cleanup idempotente |
| `IFV1-F5-Cxxxx` | Dois usuários/perfis e duas organizações sintéticas, conforme RBAC/RLS real | Verificar operação permitida no vínculo de origem/destino | Mesmo-tenant permitido; cross-tenant negado | Rota direta/API/cache cruzado; revogar sessões e fixtures |
| `IFV1-F6-Cxxxx` | Encadear o vínculo na jornada real a que pertence | Percorrer origem → destino e eventual sequência de consumidores | Estado final de negócio persistente e consistente | Quebra intermediária, repetição/retomada; cleanup |

**Atenção a classificações:** CONDICIONAL não é PASS automático. Cada caso deverá registrar condição objetiva, prova de aplicabilidade e decisão `APLICAVEL` / `N_A_JUSTIFICADO` aprovada; `N_A_JUSTIFICADO` não conta como execução PASS. Quando `produtor_referencia` ou `consumidor_referencia` nomear infraestrutura compartilhada ou não houver operação mutável, o PLAN deve escolher uma prova representativa com rastreabilidade e não executar mutação artificial. Fase 6 poderá agrupar arestas em jornadas, mas somente depois de publicar o mapeamento `caso → jornada → evidência`; não é permitido reduzir cobertura sem justificativa/aceite.

**Plano operacional mínimo proposto para cada fase:**

| Campo | F3 | F4 | F5 | F6 | F7 |
|---|---|---|---|---|---|
| Entrada | Certs F1/F2, 138 conexões | Cert F3 + matriz CRUD | Cert F4 + matriz RBAC/RLS | Cert F5 + mapa de jornadas | Certs F1–F6 |
| Casos base | 138 posições `IFV1-F3-*` | 138 `IFV1-F4-*` | 138 `IFV1-F5-*` | 138 `IFV1-F6-*` agrupáveis | Um recibo global + matriz de rastreio |
| Responsável BUILD | Agente implementador designado | Mesmo papel, sessão separada | Mesmo | Mesmo | Consolidador documental |
| Revisor | Identidade independente | Identidade independente | Identidade independente | Identidade independente | Identidade independente |
| Fixtures | Cadastro e vínculo sintéticos | Dados CRUD sintéticos | 2 usuários/perfis e 2 organizações | Jornadas sintéticas | Somente evidências, sem mutação |
| Cleanup | Remoção/reversão testada | Reversão e estado final | Sessões e dados isolados removidos | Reversão por jornada | N/A |
| Jobs a configurar/aprovar | `IFV1_F3_PROTOCOL`, `IFV1_F3_HML` | `IFV1_F4_PROTOCOL`, `IFV1_F4_HML` | `IFV1_F5_PROTOCOL`, `IFV1_F5_HML` | `IFV1_F6_PROTOCOL`, `IFV1_F6_HML` | `IFV1_F7_RECONCILIATION` |
| Artefatos propostos | `F3_CASES.json`, `F3_REPORT.json`, hashes | `F4_CASES.json`, `F4_REPORT.json`, hashes | `F5_CASES.json`, `F5_REPORT.json`, hashes | `F6_JOURNEYS.json`, `F6_REPORT.json`, hashes | `MATRIZ_GLOBAL.csv`, `CERTIFICADO_GLOBAL.md` |
| Saída | Integridade e vínculos atestados | CRUD/cache real atestado | Isolamento e acesso real atestados | Jornadas reais atestadas | Conciliação + certificado global |

**Os nomes dos jobs e artefatos nesta tabela são DESIGN PROPOSTO: ainda não existem necessariamente no GitHub.** A criação de workflow precisa de PLAN, revisão e CI. Não iniciar HML pela mera existência deste quadro.

**Critério quantitativo PROPOSTO, sujeito ao titular:** inventariar **138/138** posições por fase (com `PASS`, `FAIL`, `BLOCKED` ou `N_A_JUSTIFICADO`), exigir `FAIL=0`, `BLOCKED=0`, e para todos os casos classificados aplicáveis, `PASS=100%`; para cada `N_A_JUSTIFICADO`, documento de justificativa, fonte e aprovação. A Fase 7 só fecha com **6/6 certificados prévios** válidos, emitindo o sétimo certificado global somente após reconciliação e revisão independente. Definir orçamento de tempo, identidade de HML, limites de fixture, limpeza, contratos de relatório e SLA em PLAN específico, com aprovação expressa antes de rodar, evitando números arbitrários.

**Forma do recibo por caso, proposta:** `caseId`, `sourceConnectionId`, `phase`, `origin`, `destination`, `classification`, `applicability`, `operation`, `expected`, `observed`, `status`, `frontendSha`, `backendSha`, `harnessSha`, `deploymentId`, `workflowRunId`, `artifactId`, `sha256`, `reviewId`, `cleanupStatus`. Payloads e segredos não são exportados. Schema e negativas deverão ser implementados, testados e revisados em BUILD posterior.

### 16.3 B3 — Limitações certificadas e matriz de impacto

| Risco histórico | Fonte | Fase de prova futura proposta | Tratamento e condição de fechamento |
|---|---|---|---|
| **R-01** upload físico de arquivo grande e retomada | `fase1/CERTIFICADO.md` | F6, e F4 se a operação CRUD/Storage aplicável | Construir jornada real upload → assinatura/Storage → retomada → leitura, incluindo negativas; se fora do escopo, N/A com base normativa e aceite. Sem PASS por inferência |
| **R-02** worker/filas ponta a ponta | `fase1/CERTIFICADO.md` | F6 | Executar fluxo enfileiramento → worker → estado final → auditoria, com erro/retomada; se dependência externa indisponível, BLOCKED |
| **R-03** isolamento multiusuário/multiorganização real em todos os domínios | `fase1/CERTIFICADO.md` | F5 e regressão F6 | Dois tenants e perfis reais sintéticos, positivos e ataques negativos; nenhum vazamento admitido |

Nenhuma dessas limitações altera retroativamente o escopo dos certificados F1/F2; permanecem **pendentes de prova real no respectivo gate**.

**Matriz de mudança e reteste proposta:**

| Alteração desde baseline certificada | Evidência anterior pode ser preservada quando | Reteste exigido quando |
|---|---|---|
| Só documentação, sem mudança de código/harness/deploy/backend | Hash/proveniência e cadeia verificadas; invariantes iguais | Documentação alterar critério ou conteúdo de certificado |
| UI/layout/rota/navegação | Análise de impacto provar que nenhum caso/caminho relevante mudou | Alterar rota, componente compartilhado, menu, redirecionamento ou seletor coberto |
| CRUD, RPC, schema, cache ou backend | Contrato e runtime relevantes demonstravelmente idênticos | Mudar entidade, operação, permissão, sincronização, filtro ou relação afetada |
| Auth, RBAC/RLS, organizações, secrets ou sessão | Não assumir preservação; revisão de segurança independente | Qualquer mudança que alcance cenários F5 ou controle global, incluindo backend |
| Harness, fixture, guard, schema de relatório ou workflow | Equivalência semântica e provenance testadas e revistas | Afetar observabilidade, escopo, isolamento, critérios, contagem de erros ou verificador |
| Deployment HML ou versão de produto | Identidade fixada e compatibilidade demonstrada caso a caso | SHA/deployment divergente sem prova de equivalência e impacto |

Toda decisão sobre preservação ou reteste precisa registrar `baseline → HEAD candidato → diff/impacto → casos afetados → justificativa → revisão independente`. Evidências antigas devem permanecer imutáveis; novas evidências são encadeadas por ledger append-only quando aprovado.

### 16.4 B4 — Quatro estados formais e autorização

1. **HISTÓRICO CONSOLIDADO:** fatos conferidos em documentos, certificados, PRs e reports já integrados; o merge deste arquivo não certifica os novos gates.
2. **PROPOSTA DE DETALHAMENTO:** novos critérios, jobs, matrizes, fixtures e thresholds das Fases 3–7 descritos nesta PR; não executáveis como obrigação normativa até aceite.
3. **PLANO APROVADO PELO TITULAR:** decisão expressa e rastreável do titular identificando **versão, SHA e escopo de aprovação**, inclusive divergências e N/A; aprovação de review técnico não substitui aceite do titular.
4. **GATE OPERACIONAL INTEGRADO:** plano aprovado, review independente APPROVE no HEAD, checks obrigatórios SUCCESS, merge protegido e readback em `main`; somente então abrir PLAN/BUILD da fase autorizada.

**Registro de aceite pendente (não preencher antes da manifestação):**

- Documento: `PLANO_MESTRE_AUDITORIA_INTEGRACAO_FUNCIONAL_V1_7_FASES.md`
- Versão proposta: **v1.1, revisão corretiva da PR #653**
- SHA da `main` utilizada como base da PR: `b2feca7f5d8976709ba95a2ce44407f910eabe19`
- SHA final da PR: **a registrar após o último commit**
- Identidade do titular e declaração expressa de aceite dos critérios F3–F7: **PENDENTE**
- Revisor independente, review e SHA aprovado: **PENDENTE**
- Checks obrigatórios no SHA aprovado: **PENDENTE**
- Merge SHA, readback do arquivo e anexo, checkpoint: **PENDENTE**
- Status vigente: **PROPOSTA DOCUMENTAL EM REVISÃO**.

**Checklist de readback obrigatório após merge:** consultar PR #653 e reviews; conferir `main` HEAD e ancestry do merge, recuperar pelo SHA integrado este plano e a matriz CSV; comparar conteúdo e contagem (138 relações, 552 posições propostas), consultar checks associados ao SHA, verificar registro de aceite; atualizar o painel F1/F2 certificados e F3–F7 conforme evidência. Se qualquer etapa falhar, não declarar plano canônico completo.

## 17. Próxima ação com limites claros

**Já executável:** revisão documental desta PR, testes estáticos e correção de rastreabilidade. **Ainda não autorizado pelo documento:** mutações em HML ou execução/certificação das Fases 3–7. Próxima ação: revisor independente avaliar esta emenda, apontar inconsistências ou solicitar correções; titular validar expressamente os critérios operacionais novos; somente após aceite, checks, merge e readback, iniciar PLAN específico da Fase 3 com matriz de casos derivada do inventário.

Nenhum termo acima deve ser interpretado como criação silenciosa de workflows, fixtures, evidências de runtime ou certificados.

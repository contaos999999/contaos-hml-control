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

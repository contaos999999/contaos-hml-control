# ContaOS 4.1 — PLANO ÚNICO V2: desenvolvimento, certificação, integração interna e cumulativa V1↔V2

**Versão documental:** proposta P0, 14/11/2026. **Status:** PLANO PARA AUDITORIA INDEPENDENTE, não certificado, não autorização de BUILD e não mudança automática em PROD.
**Escopo:** V2 e método de integração cumulativa V1→V5. **Regra vinculada:** [P0 RCA/impacto/antirretrabalho](../governanca/P0_RCA_IMPACTO_ANTIRRETRABALHO_V2_V5_2026-11-14.md), além do P0 de ordem por versão.
**Bases:** AGENTS.md, P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md, P0_ORDEM_POR_VERSAO_4_1.json, plano mestre V1, PLANO_MESTRE_AUDITORIA_INTEGRACAO_FUNCIONAL_V1_7_FASES.md, PRD Mestre, catálogo original de 100 regulares/97 atômicos, requisitos 08B, BRAND-01 e 12 NFR. Antes do PLAN executável, validar 25 fontes canônicas e HEADs atuais dos dois repositórios; a simples redação deste plano não substitui esse gate.

## 0. Objetivo e precedências
V2 deverá ser funcionalmente completa, internamente integrada e cumulativamente integrada à V1, evitando retrabalho e correções que criem novas falhas. Cada versão posterior herda a obrigação de integrar com **todas** as anteriores, inclusive relações diretas não adjacentes. Não reabrir certificados válidos da V1 sem delta que invalide seu escopo, mas condicionar a progressão ao estado comprovado da auditoria interna V1. Certificado funcional V1 permanece válido no seu escopo próprio.
**Execução:** 3 etapas consecutivas de 8 + 7 + 7 = **22 fases**; três certificados separados, último cumulativo obrigatório à progressão. A numeração aqui é local a cada etapa e não renumera os prompts canônicos.

## 1. Escopo fechado V2 e rastreabilidade
- **Regulares:** 44,45,46,47,48,49,76,77 (oito).
- **Atômicos:** 025–043 (19 requisitos): DIL 025–028; PRO 029–032; ACT 033–036; CONTEST 037–040; KB 041–043.
- **Transversais:** BRAND-01/000 e 12 NFR/085–096, apropriados a cada fluxo e gate.
- **Telas:** V2-01 a V2-08 conforme fontes canônicas; confrontar rotas e componentes reais, sem inventar novas telas.
- **Funcionalidades:** ingestão de diligência/parecer, extração por apontamento, impactos monetários e prazos; análise de procedência, fundamentação e evidência contrária; ações, prazos, prioridades, revalidação de solução; contestação assistida, prova por afirmação, aprovação humana, resultado; base histórica, reincidência e revisão de precedentes; rodadas e reapresentação com portão 100% dos apontamentos tratados.
- **Vínculos fundamentais V1↔V2:** organização→contratante→contrato→competência→documentos/snapshots→apresentação/protocolo→diligência→apontamento→análise→ação/contestação→evidência/desfecho→reapresentação→validação; incluir relações efetivamente existentes e evitar causalidade artificial.
- **Contrato:** frontend React/Lovable → API/RPC/Edge Supabase HML → PostgreSQL/Storage/auditoria; backend é autoridade, RLS/RBAC fail-closed; sem backend paralelo; PROD vedado.
Cada item do catálogo deve mapear: ID, fonte, versão, tela, operação, entidade, consumidor, contrato backend, RBAC/RLS, teste, evidência, PR, commit, CI e classificação.

## 2. ETAPA I — Certificação funcional integral V2 (8 fases)
**I.1 Baseline e inventário:** obter HEADs reais, catálogos e certificados V1; reconciliar lacunas antes de alterar código; construir mapa dependências V1/V2 e matriz 8+19+transversais. Marcar N/A com justificativa, nunca como PASS.
**I.2 Contratos/backend:** validar schemas, migrações, RPCs, Edge/Queue, auth, Storage, concorrência, idempotência, versionamento, regras e evidências do HML; confirmar autoridade, sem inventar contrato. Dependência inexistente = NO-GO isolado e PLAN backend separado/autorizado, não fallback no frontend.
**I.3 Frontend integral:** implementar telas reais V2, navegação, listagens, ações e CRUD permitidos; componentes compartilhados; estados vazio/erro/carregamento; fonte única de dados e cache por usuário/org/entidade.
**I.4 Segurança:** matriz papel×recurso×ação×organização; MASTER e demais perfis; casos positivos/negativos, troca de sessão/org, rotas diretas, limites da automação/IA, RLS e não vazamento entre tenants.
**I.5 Qualidade visual:** BRAND-01 e sistema existente; 1440/1280/768/390×claro/escuro, teclado, foco, responsividade, contraste, textos PT-BR, identidade, acessibilidade e testes de estados autenticados.
**I.6 Jornadas reais:** documento/parecer→apontamentos→classificação→ações/contestações→rodadas→reapresentação→desfecho; positivos/negativos, concorrência, retorno de rede e retenção de snapshots. Teste de portão: 100% tratados não significa 100% deferidos; decisão final pertence ao contratante.
**I.7 Auditoria independente:** leitura apenas de fonte congelada; revisar cobertura, causalidade de desvios, evidências HML reais, diffs, regressão V1 impactada, segurança e qualidade. Implementador não certifica trabalho próprio.
**I.8 Certificado V2 funcional:** relatório por item, risco residual, PR/CI/Teste C no SHA exigido, rollback e recibo integrado; PASS somente com evidências. Não confundir essa saída com integração interna ou cumulativa.

## 3. ETAPA II — Auditoria de integração funcional **interna** V2 (7 fases)
**II.1 Inventário e matriz de conexões:** todas telas, componentes, produtores, consumidores, RPCs, tabelas, Edge, eventos, fluxo de dados e conexões condicionais; grafo com classificação e evidências.
**II.2 Navegação funcional:** rotas autenticadas, deep-link, menus, sessão, recarga, back/forward, mobile, logs e acesso autorizado, não só screenshot de login.
**II.3 Cadastros e relacionamentos:** chaves, cardinalidade, obrigatoriedade, cross-links, propagação e ausência de órfãos reais.
**II.4 CRUD e sincronização:** create/read/update/delete ou arquivar quando permitido; cache, concorrência, atualizações em consumidores, persistência, rollback e idempotência.
**II.5 RBAC/RLS e isolamento:** matriz de leitura/mutação por papel/organização, fail-closed, troca A/B, chamadas diretas e sessões revogadas; comprovar com tipo de teste correto, sem afirmar E2E a partir de mock.
**II.6 Jornadas integradas:** fluxos V2 ponta a ponta cruzando telas, regras e entidades, com sucesso, falha e retomada; cada aresta crítica deve possuir caso ou justificativa.
**II.7 Consolidação e certificado interno:** seis recibos válidos, grafo e matriz completos, auditor independente, zero FAIL/BLOCKED obrigatório não tratado; certificado independente em PR integrado.

## 4. ETAPA III — Auditoria de integração **cumulativa** V1↔V2 (7 fases)
**III.1 Inventário de dependências:** cruzamento V1 e V2: telas, entidades, snapshots, documentos, normas, eventos, permissões, produtor/consumidor, arestas obrigatórias/condicionais/N/A.
**III.2 Integridade interversões:** relacionar diligência à apresentação e à competência V1; apontamentos aos documentos originais, normas aplicáveis e versões temporais; contestação à prova e à origem; histórico imutável.
**III.3 Fluxos e contratos ponta a ponta:** provar jornadas iniciadas V1 e concluídas V2, e consulta regressiva V2→V1; nenhuma duplicação da fonte de verdade.
**III.4 CRUD e sincronização interversões:** mudanças V2 atualizam consumidores autorizados sem sobrescrever versões V1; teste de cache, reconciliação, conflitos e regressão de contratos.
**III.5 Segurança acumulada:** testar RBAC/RLS A/B, permissão herdada, nenhuma ampliação de acesso por ligação V1/V2, negações e trilha de auditoria.
**III.6 Linhagem bidirecional e regressão:** cada objeto com origem, antecedente(s), evento de transformação e sucessores; demonstrar rastreio progressivo V1→V2 e regressivo V2→V1, sem inventar causalidade; testar regressão dirigida por grafo de impacto.
**III.7 Certificado acumulado V1–V2:** auditor independente valida todas as arestas obrigatórias aplicáveis e jornadas críticas; três certificados integrados à main, checkpoint com HEAD/CI/evidências/ressalvas e decisão sobre liberação V3.

## 5. Regra cumulativa geral V1–V5
V3 certifica V3 interna e V1+V2+V3; V4 certifica V4 interna e V1+V2+V3+V4; V5 certifica V5 interna e V1+V2+V3+V4+V5.
O grafo de linhagem deve suportar: **V5→V4/V3/V2/V1 conforme dependências reais**, inclusive referências diretas a versão mais antiga. Se determinado objeto não depende de uma camada intermediária, o sistema registra a relação verdadeira, não fabrica passos; se depende e falta referência, é falha impeditiva. Elementos genuinamente independentes têm origem própria documentada.
Exemplo legítimo: controle V5 → norma vigente/revisão de regra → padrão/precedente V4, quando houver → alerta preventivo V3, quando houver → desfecho V2 → documento/snapshot/competência/contrato V1. Prova por identificadores, versões, evidências, datas e fatos, não por semelhança textual.

## 6. MATRIZ GLOBAL E EVIDÊNCIAS
A matriz central deve conter, por objeto/relação: ID global, organização/contrato/competência, versão de criação, origem, predecessores, sucessores, tipo da aresta, norma/regra com vigência, permissões, entidades/RPC/API, telas, evento/ator e timestamp, snapshot/hash, classificação de aplicabilidade, caso de teste, log/evidência/PR/commit/CI e status.
Para cada fase, entregar mapa estático + execução dinâmica requerida + negativas + referência ao HEAD/ambiente + relatório de cobertura. Cobertura documental ≠ estática ≠ funcional ≠ E2E autenticada. Toda métrica tem numerador, denominador, exclusões justificadas e fonte.
Zero FAIL/BLOCKED em arestas/requisitos obrigatórios aplicáveis; não declarar 100% quando houver não verificado sem dispensa formal admissível. Evidência anterior válida reutilizável sob análise de impacto.

## 7. PROTOCOLO P0 ANTIRRETRABALHO INCORPORADO AO PLANO
**Antes de cada correção, crítica ou trivial, aplicar obrigatoriamente:**
1. **REPRODUZIR:** falha observável, ambiente, HEAD, entrada, saída esperada/real, logs, caso negativo, frequência e classe (código, dados, contrato, infraestrutura, teste, permissão, ferramenta).
2. **LOCALIZAR A CAUSA:** decompor cadeia de execução, investigar hipóteses alternativas, fronteiras frontend↔API↔banco, diffs e eventos anteriores; registrar evidência que confirma causa raiz e que elimina hipóteses concorrentes. Não se satisfazer com "causa plausível".
3. **MAPEAR IMPACTO:** grafo produtor→consumidor (rotas, cadastros, RPCs, RLS, efeitos de cache, versionamento, NFR, BRAND, CI, tipos), efeitos indiretos e riscos de regressão, inclusive V1.
4. **PROJETAR SOLUÇÃO COMPLETA:** corrigir fonte verdadeira, não mascarar sintoma; comparar alternativas; selecionar menor mudança completa e segura; lista fechada de arquivos, migrações, testes, rollback, critérios de saída e como detectar falhas novas.
5. **RED DE CAUSA RAIZ:** teste que falha pelo problema original e testes negativos das regressões previstas. Usar simulação só onde autorizada, sem promovê-la a prova real.
6. **BUILD CONTROLADO:** uma alteração coesa, revisão de dependências afetadas, sem escopo incidental nem novos "remendos" de sintomas. Não alterar gate/teste para esconder falha.
7. **GREEN + IMPACT TESTS:** primeiro testes focalizados/contratos/negativos, depois suites exigidas por risco e pelos gates. Confirmar que defeito não persiste e que correção não cria outro.
8. **AUDITORIA INDEPENDENTE:** avaliar o diagnóstico, não apenas o diff; procurar casos não previstos, falhas introduzidas e cobertura de causais.
9. **ENCERRAR + APRENDER:** registro RCA, prevenção permanente, custo aproximado de execuções/tokens quando mensurável, PR, CI, SHA, estado e anti-regressão reusável.

### Regra de parada de ciclo
- Mesma falha após duas tentativas comprovadas de correção ou segunda regressão causada na mesma área: **suspender novos remendos nesse defeito** e realizar revisão arquitetural de causa raiz em escopo ampliado, mantendo outras frentes independentes.
- Retry idêntico sem alteração de hipótese, código, dados ou condição externa verificada é proibido; para intermitência externa, delimitar retry técnico com diagnóstico e registro, sem loop infinito.
- Se sintoma não tiver causa confirmada, prosseguir apenas com investigação e testes isolados; contenção emergencial pode ser proposta quando segura, explicitando que não resolve a causa.
- Mudança que gera falha nova exige classificação como regressão da correção, reversão/isolamento se necessário e reconciliação de toda a cadeia, não "patch do patch" sem análise.
- Causas interdependentes identificadas cedo deverão ser tratadas em plano conjunto por subsistema, com PRs de tamanho revisável e gates preservados.

### Eficiência de tokens e tempo
- Usar diff/HEAD e índice de arquivos, consultas de trechos pertinentes, cache e evidências válidas; leitura integral somente quando obrigatória pelas normas ou necessária à causa.
- Uma sessão implementa, outra audita, com entradas curtas e artefatos permanentes. Auditor vê SHA congelado e matriz, não repete toda implementação.
- Organizar testes: reproduzir→unitário direcionado→contrato/segurança do impacto→regressão por dependência→suite/CI/Teste C nos gates exigidos; não suprimir prova canônica por economia.
- Executar checks sobre **um SHA identificado**, não rodar todo pipeline a cada análise textual. Não repetir jobs caros sem delta invalidante.
- Manter checkpoint em GitHub após marcos, registrando HEAD, causas, evidências, dependências, ações concluídas, pendências e próximo passo, preservando contexto entre agentes/conversas.
- Medir: (a) falhas reabertas pela mesma causa, (b) regressões introduzidas, (c) retries sem nova evidência, (d) ciclos RED→GREEN por causa, (e) custo de testes/tokens se fonte real disponível. Metas de governança: 0 retries cegos, 0 regressões conhecidas em merge, 100% das correções com RCA+impacto documentados; não inventar economia percentual.

## 8. Gates de liberação e restrições
Três portões: A certificado funcional da versão; B certificado de integração interna; C certificado cumulativo. Cada um exige PR protegido, CI e auditor independente aplicáveis; regra nova exige **emenda formal do P0 guard antes de ser afirmada como automatizada**. Não reduzir a segurança para passar CI.
P0 de versão, PRD, 25 fontes, BRAND-01, 100/97, GOV-020, LOCK-TYPES, RLS/RBAC, Teste C, Zero-Drift, segregação de funções, HML-only e PROD proibido continuam. Se novo gate conflitar com certificação anterior, preservar esta e documentar a diferença entre certificado funcional, interno e cumulativo; não reclassificar retrospectivamente provas.
Nenhuma alteração de produto, workflow, branch protection ou banco decorre deste documento. Cada PLAN executável requer baseline novo, escopo fechado, revisão, CI, gates e autorização específica quando aplicável.

## 9. Entregáveis finais
1. Matriz 8 regulares + 19 RF + BRAND + NFR; 2. inventário V2; 3. contratos e testes; 4. relatórios visuais e de segurança; 5. certificado funcional V2; 6. grafo e matriz interna; 7. certificado interno V2; 8. grafo cumulativo V1–V2 e provas progressivas/regressivas; 9. certificado cumulativo V1–V2; 10. banco de RCA/impactos e testes antirregressão; 11. checkpoint com SHA/PR/CI e decisão V3.
**Decisão de aprovação deste plano:** não equivale à execução nem certificação. Só se torna norma integrada mediante revisão independente, checks válidos e merge protegido.

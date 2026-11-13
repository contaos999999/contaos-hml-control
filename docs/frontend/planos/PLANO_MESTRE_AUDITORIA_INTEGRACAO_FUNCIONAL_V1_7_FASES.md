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

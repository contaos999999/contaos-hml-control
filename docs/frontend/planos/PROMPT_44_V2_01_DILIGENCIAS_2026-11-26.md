# PLAN P0 44 · V2-01 Diligências

26/11/2026. Execução após aprovação do plano mestre da [PR #825](https://github.com/contaos999999/contaos-hml-control/pull/825). Base examinada `af0c36c11bdfa647abdbd37b6199b0a0b32489cd`, backend normativo `a1516de1d8949e505d83b5e000eb1cc558b217a7` e blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` de `types.ts`. O P0 aponta o regular 44 e a main reconhece os recibos da V1. Fases I.1 e I.2 deste recorte referenciam o checkpoint e as 37 superfícies da matriz mestre.

## Requisito e GATE de compatibilidade

Regular 44, atômicos 000 e 025–028 no crosswalk canônico. A 44 lista a projeção dos ciclos e seus metadados oficiais. O registro de parecer e a extração pertencem ao PLAN 76. O detalhamento do ciclo e dos itens pertence aos PLANs 45 e 46. Condições de aceite incluem rota, acesso, negação pelo contrato, estados, ausência de segredo e de mutação crítica pelo cliente, teclado, quatro larguras, console e segurança.

O HML oficial está ativo. O [recibo de metadados](../auditorias/preflight/V2_PROMPT44_CONTRATO_2026-11-26.json) confirma `ciclos_diligencia`, as chaves e campos necessários, a leitura autenticada sob RLS por contrato, a negação por ausência de grant ao anônimo e a RPC `obter_visao_geral_competencia(p_id_competencia uuid)` executável pelo papel autenticado. A consulta de catálogo preservou dados e políticas. O CODE_FIXTURE vai exercitar o transporte do frontend e negações simuladas. Contraprovas LIVE autenticadas seguem o GATE PROD conforme a PR #718.

## Entrega e interface

- Rota `/competencias/:id/diligencias`. A V114, após consulta autorizada da competência, exibe a entrada Diligências. A tela devolve à V114 da mesma competência.
- `listarCiclosDiligencia(competencia, organizacao, contrato, offset, signal)` no módulo de leitura. Seleciona IDs, rodada, situação oficial, recebimento, prazo, encerramento e versão. Filtra pelos três IDs efetivos, ordena por rodada e ID em ordem decrescente e pagina em 25 registros com contagem. Valida contrato e identidade de todos os itens, com rejeição de forma inesperada ou duplicada.
- A tela resolve usuário, organização ativa e competência autorizada pela RPC existente. Retira lista e paginação pendentes de outro contexto, cancela requisições na troca de rota/organização/sessão e revalida o contexto antes do resultado. A RLS permanece autoridade de leitura.
- Renderizar rodada, estado oficial traduzido, recebimento, prazo calendário em PT-BR e encerramento quando houver. Prever carregamento, vazio autorizado, falta de permissão, competência indisponível, erro e tentativa de novo. Expor foco, labels, feedback de status e navegação por teclado. O acesso ao detalhe do ciclo entra junto com a rota 45.
- Teste C usa as superfícies V114 e V2-01 reais com transporte sintético sem chamadas externas, em 1440/1280/768/390 claro e escuro. Usa a infraestrutura Playwright existente, preserva as matrizes históricas V1 e F2 e acrescenta relatório do delta V2 com HEAD, árvore, capturas e checksums.

## Allowlist fechada do BUILD

- `src/routes/competencias_.$id_.diligencias.tsx`
- `src/routeTree.gen.ts`
- `src/components/competencias/CompetenciaVisaoGeral.tsx`
- `src/components/diligencias/DiligenciasCompetencia.tsx`
- `src/lib/diligencias/diligenciasDados.ts`
- `src/test/v2-44-contrato.test.ts`
- `src/test/v2-44-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

O artefato Teste C é publicado pelo workflow existente. O plano mantém os paths do workflow, o backend, os tipos protegidos, o manifesto histórico P0-LOCK-CERT e as permissões fora do diff de BUILD.

## RCA, verificação e rollback

Nova funcionalidade. Antes do BUILD, a rota Diligências inexiste no routeTree. Provar RED no GitHub no caso `V2-01 registra a rota Diligencias e a prova visual` em `scripts/testc/visual-audit.test.mjs`, mantendo o RED como ancestral da prova GREEN. Nos testes do adaptador e da tela, cobrir o caso autorizado em duas rodadas, partida e volta na mesma competência, ABA de usuário/organização em trânsito, paginação, convergência de estado, retorno cruzado, negação, vazio e falhas. O mapa de impacto da ficha RCA cobre V1-14, V2-01, árvore de rotas e auditoria visual. Vincular os casos executáveis de CONTRATO, RBAC_RLS, DADOS_INTEGRIDADE e DEPENDENCIAS ao hash do recibo prévio.

Executar regressão V114, fluxos de sessão e controles P0. Exigir CI integral, GOV-020, Zero-Drift, LOCK-TYPES, lint, TypeScript, Teste C material, revisão assistida e merge protegido no HEAD final. Se falhar a autorização da consulta, parar o BUILD dependente e registrar no gate. Rollback por revert protegido do incremento frontend, com verificação da rota V114 e do manifesto P0, sem operação de dados.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

ContaOS Brand v1.0/BRAND-01, componentes e tokens atuais, português brasileiro, montagem visível em quatro larguras e dois temas. Usar GitHub e Supabase autorizados, prova em um HEAD e nenhuma etapa visual presumida. LIVE `NOT_RUN`, PROD `NO-GO`.
